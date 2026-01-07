import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up Replit Auth
  await setupAuth(app);

  // Auth User helper
  app.get(api.auth.me.path, async (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.json(null);
    }
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    res.json(user || null);
  });
  
  app.get(api.events.list.path, async (req: any, res) => {
    let isAdmin = false;
    if (req.isAuthenticated()) {
      const dbUser = await storage.getUser(req.user.claims.sub);
      isAdmin = dbUser?.role === "admin";
    }
    
    const events = await storage.getEvents(!isAdmin);
    res.json(events);
  });

  app.get(api.events.get.path, async (req, res) => {
    const event = await storage.getEvent(Number(req.params.id));
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  });

  app.post(api.events.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const dbUser = await storage.getUser(req.user.claims.sub);
      
      if (!dbUser) {
        return res.status(401).json({ message: "User profile not found. Please log in again." });
      }

      if (dbUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can create events. Your current role is: " + dbUser.role });
      }

      const input = api.events.create.input.parse(req.body);
      const event = await storage.createEvent({ 
        ...input, 
        createdById: dbUser.id,
        isPublished: false 
      });
      res.status(201).json(event);
    } catch (err) {
      console.error("Event creation error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error while creating event" });
    }
  });

  app.patch(api.events.publish.path, isAuthenticated, async (req: any, res) => {
    const dbUser = await storage.getUser(req.user.claims.sub);
    
    if (!dbUser || dbUser.role !== "admin") {
      return res.status(401).json({ message: "Only admins can publish events" });
    }

    const id = Number(req.params.id);
    const input = api.events.publish.input.parse(req.body);
    const updated = await storage.updateEvent(id, { isPublished: input.isPublished });
    res.json(updated);
  });

  app.delete(api.events.delete.path, isAuthenticated, async (req: any, res) => {
    const dbUser = await storage.getUser(req.user.claims.sub);
    
    if (!dbUser || dbUser.role !== "admin") {
      return res.status(401).json({ message: "Only admins can delete events" });
    }

    const id = Number(req.params.id);
    await storage.deleteEvent(id);
    res.status(204).send();
  });

  app.post(api.attendees.create.path, async (req: any, res) => {
    try {
      const eventId = Number(req.params.eventId);
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const input = api.attendees.create.input.parse(req.body);
      
      if (event.attendees.length >= event.capacity) {
        return res.status(400).json({ message: "Event is at full capacity" });
      }

      let userId = undefined;
      if (req.isAuthenticated()) {
        const dbUser = await storage.getUser(req.user.claims.sub);
        if (dbUser) {
          userId = dbUser.id;
          const existing = await storage.getAttendeeByEventAndUser(eventId, userId);
          if (existing) {
            return res.status(400).json({ message: "You are already registered for this event" });
          }
        }
      }

      const attendee = await storage.createAttendee({ ...input, eventId, userId });
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

  return httpServer;
}
