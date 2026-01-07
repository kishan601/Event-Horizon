import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  capacity: integer("capacity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendees = pgTable("attendees", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  registeredAt: timestamp("registered_at").defaultNow(),
});

export const eventsRelations = relations(events, ({ many }) => ({
  attendees: many(attendees),
}));

export const attendeesRelations = relations(attendees, ({ one }) => ({
  event: one(events, {
    fields: [attendees.eventId],
    references: [events.id],
  }),
}));

export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertAttendeeSchema = createInsertSchema(attendees).omit({ id: true, registeredAt: true });

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Attendee = typeof attendees.$inferSelect;
export type InsertAttendee = z.infer<typeof insertAttendeeSchema>;
