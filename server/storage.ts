import { db } from "./db";
import {
  events,
  attendees,
  type InsertEvent,
  type InsertAttendee,
  type Event,
  type Attendee
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getEvents(): Promise<(Event & { attendeeCount: number })[]>;
  getEvent(id: number): Promise<(Event & { attendees: Attendee[] }) | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  deleteEvent(id: number): Promise<void>;
  createAttendee(attendee: InsertAttendee): Promise<Attendee>;
  deleteAttendee(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getEvents(): Promise<(Event & { attendeeCount: number })[]> {
    const result = await db
      .select({
        ...events,
        attendeeCount: sql<number>`count(${attendees.id})::int`,
      })
      .from(events)
      .leftJoin(attendees, eq(events.id, attendees.eventId))
      .groupBy(events.id)
      .orderBy(sql`${events.date} asc`);
    
    return result;
  }

  async getEvent(id: number): Promise<(Event & { attendees: Attendee[] }) | undefined> {
    const event = await db.select().from(events).where(eq(events.id, id)).then(res => res[0]);
    if (!event) return undefined;

    const eventAttendees = await db
      .select()
      .from(attendees)
      .where(eq(attendees.eventId, id))
      .orderBy(attendees.registeredAt);

    return { ...event, attendees: eventAttendees };
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(attendees).where(eq(attendees.eventId, id));
    await db.delete(events).where(eq(events.id, id));
  }

  async createAttendee(attendee: InsertAttendee): Promise<Attendee> {
    const [newAttendee] = await db.insert(attendees).values(attendee).returning();
    return newAttendee;
  }

  async deleteAttendee(id: number): Promise<void> {
    await db.delete(attendees).where(eq(attendees.id, id));
  }
}

export const storage = new DatabaseStorage();
