import { pgTable, serial, text, timestamp, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { reportsTable } from "./reports";

export const allocationStatusEnum = pgEnum("allocation_status", ["Pending", "Approved", "Rejected"]);

export const aiAllocationsTable = pgTable("ai_allocations", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").references(() => reportsTable.id),
  priorityLevel: text("priority_level").notNull(),
  priorityScore: integer("priority_score").notNull().default(0),
  allocatedResources: jsonb("allocated_resources"),
  assignedVolunteers: jsonb("assigned_volunteers"),
  allocationReason: text("allocation_reason"),
  allocationSummary: text("allocation_summary"),
  status: allocationStatusEnum("status").notNull().default("Pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAiAllocationSchema = createInsertSchema(aiAllocationsTable).omit({ id: true, createdAt: true });
export type InsertAiAllocation = z.infer<typeof insertAiAllocationSchema>;
export type AiAllocation = typeof aiAllocationsTable.$inferSelect;
