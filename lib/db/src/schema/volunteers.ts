import { pgTable, serial, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const volunteerStatusEnum = pgEnum("volunteer_status", ["Available", "Assigned", "Busy"]);

export const volunteersTable = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull().unique(),
  skills: text("skills").array().notNull().default([]),
  availability: text("availability").notNull().default("Weekends"),
  currentStatus: volunteerStatusEnum("current_status").notNull().default("Available"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVolunteerSchema = createInsertSchema(volunteersTable).omit({ id: true, createdAt: true });
export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type Volunteer = typeof volunteersTable.$inferSelect;
