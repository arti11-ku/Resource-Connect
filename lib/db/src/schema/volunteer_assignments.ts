import { pgTable, serial, timestamp, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tasksTable } from "./tasks";
import { volunteersTable } from "./volunteers";

export const volunteerAssignmentsTable = pgTable("volunteer_assignments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasksTable.id).notNull(),
  volunteerId: integer("volunteer_id").references(() => volunteersTable.id).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  assignmentStatus: text("assignment_status").notNull().default("active"),
});

export const insertVolunteerAssignmentSchema = createInsertSchema(volunteerAssignmentsTable).omit({ id: true, assignedAt: true });
export type InsertVolunteerAssignment = z.infer<typeof insertVolunteerAssignmentSchema>;
export type VolunteerAssignment = typeof volunteerAssignmentsTable.$inferSelect;
