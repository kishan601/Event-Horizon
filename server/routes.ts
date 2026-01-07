import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.events.list.path, async (req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.get(api.events.get.path, async (req, res) => {
    const event = await storage.getEvent(Number(req.params.id));
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  });

  app.post(api.events.create.path, async (req, res) => {
    try {
      const input = api.events.create.input.parse(req.body);
      const event = await storage.createEvent(input);
      res.status(201).json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.events.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const event = await storage.getEvent(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    await storage.deleteEvent(id);
    res.status(204).send();
  });

  app.post(api.attendees.create.path, async (req, res) => {
    try {
      const eventId = Number(req.params.eventId);
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const input = api.attendees.create.input.parse(req.body);
      
      // Check capacity logic could go here, but kept simple for now
      // Or we can rely on frontend validation + simple check
      if (event.attendees.length >= event.capacity) {
        return res.status(400).json({ message: "Event is at full capacity" });
      }

      const attendee = await storage.createAttendee({ ...input, eventId });
      res.status(201).json(attendee);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.attendees.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    // In a real app we might check if attendee exists first, 
    // but delete is idempotent-ish so we can just try delete
    await storage.deleteAttendee(id);
    res.status(204).send();
  });

  // Seed data function
  async function seed() {
    const events = await storage.getEvents();
    if (events.length === 0) {
      const event1 = await storage.createEvent({
        title: "Tech Conference 2024",
        description: "Annual technology summit featuring AI, Cloud, and Web3.",
        date: new Date("2024-09-15T09:00:00Z"),
        location: "Convention Center, SF",
        capacity: 100,
      });

      await storage.createAttendee({
        eventId: event1.id,
        name: "Alice Johnson",
        email: "alice@example.com",
      });

      await storage.createAttendee({
        eventId: event1.id,
        name: "Bob Smith",
        email: "bob@example.com",
      });

      await storage.createEvent({
        title: "React Workshop",
        description: "Hands-on deep dive into React Server Components.",
        date: new Date("2024-06-20T10:00:00Z"),
        location: "Tech Hub, NYC",
        capacity: 20,
      });
    }
  }

  // Run seed
  seed().catch(console.error);

  return httpServer;
}
