import { pgTable, serial, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { reportsTable } from "./reports";
import { ngosTable } from "./ngos";

export const taskStatusEnum = pgEnum("task_status", ["pending", "assigned", "in-progress", "completed"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high"]);

export const tasksTable = pgTable("tasks", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").references(() => reportsTable.id),
  ngoId: integer("ngo_id").references(() => ngosTable.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: taskStatusEnum("status").notNull().default("pending"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  assignedTo: text("assigned_to"),
  deadline: text("deadline"),
  category: text("category"),
  location: text("location"),
  skills: text("skills").array().notNull().default([]),
  points: integer("points").notNull().default(50),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasksTable).omit({ id: true, createdAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasksTable.$inferSelect;
