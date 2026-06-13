import { pgTable, serial, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const reportStatusEnum = pgEnum("report_status", ["Pending", "Under Review", "Approved", "Completed"]);
export const reportSeverityEnum = pgEnum("report_severity", ["Low", "Medium", "High", "Critical"]);
export const reportCategoryEnum = pgEnum("report_category", ["Flood", "Fire", "Earthquake", "Medical", "Food", "Shelter", "Other"]);

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").references(() => usersTable.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: reportCategoryEnum("category").notNull(),
  severity: reportSeverityEnum("severity").notNull(),
  location: text("location").notNull(),
  status: reportStatusEnum("status").notNull().default("Pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({ id: true, createdAt: true });
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
