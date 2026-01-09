import { db } from "./db";
import {
  events,
  attendees,
  users,
  type InsertEvent,
  type InsertAttendee,
  type Event,
  type Attendee,
  type User
} from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;

  getEvents(onlyPublished?: boolean): Promise<(Event & { attendeeCount: number })[]>;
  getEvent(id: number): Promise<(Event & { attendees: Attendee[] }) | undefined>;
  createEvent(event: InsertEvent & { createdById: string }): Promise<Event>;
  updateEvent(id: number, updates: Partial<Event>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;

  createAttendee(attendee: InsertAttendee & { userId?: string }): Promise<Attendee>;
  deleteAttendee(id: number): Promise<void>;
  getAttendeeByEventAndUser(eventId: number, userId: string): Promise<Attendee | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: any): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getEvents(onlyPublished = false): Promise<(Event & { attendeeCount: number })[]> {
    let query = db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        date: events.date,
        location: events.location,
        capacity: events.capacity,
        isPublished: events.isPublished,
        createdById: events.createdById,
        createdAt: events.createdAt,
        attendeeCount: sql<number>`COALESCE(count(${attendees.id}), 0)::int`,
      })
      .from(events)
      .leftJoin(attendees, eq(events.id, attendees.eventId));

    if (onlyPublished) {
      // @ts-ignore
      query = query.where(eq(events.isPublished, true));
    }

    return await query
      .groupBy(events.id)
      .orderBy(sql`${events.date} asc`);
  }

  async getEvent(id: number): Promise<(Event & { attendees: Attendee[] }) | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    if (!event) return undefined;

    const eventAttendees = await db
      .select()
      .from(attendees)
      .where(eq(attendees.eventId, id))
      .orderBy(attendees.registeredAt);

    return { ...event, attendees: eventAttendees };
  }

  async createEvent(event: InsertEvent & { createdById: string }): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: number, updates: Partial<Event>): Promise<Event> {
    const [updated] = await db.update(events).set(updates).where(eq(events.id, id)).returning();
    return updated;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(attendees).where(eq(attendees.eventId, id));
    await db.delete(events).where(eq(events.id, id));
  }

  async createAttendee(attendee: InsertAttendee & { userId?: string }): Promise<Attendee> {
    const [newAttendee] = await db.insert(attendees).values(attendee).returning();
    return newAttendee;
  }

  async deleteAttendee(id: number): Promise<void> {
    await db.delete(attendees).where(eq(attendees.id, id));
  }

  async getAttendeeByEventAndUser(eventId: number, userId: string): Promise<Attendee | undefined> {
    const [attendee] = await db
      .select()
      .from(attendees)
      .where(and(eq(attendees.eventId, eventId), eq(attendees.userId, userId)));
    return attendee;
  }
}

export const storage = new DatabaseStorage();
