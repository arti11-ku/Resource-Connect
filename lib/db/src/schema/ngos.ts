import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const ngosTable = pgTable("ngos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull().unique(),
  ngoName: text("ngo_name").notNull(),
  registrationNumber: text("registration_number").notNull().unique(),
  contactDetails: text("contact_details"),
  address: text("address"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNgoSchema = createInsertSchema(ngosTable).omit({ id: true, createdAt: true });
export type InsertNgo = z.infer<typeof insertNgoSchema>;
export type Ngo = typeof ngosTable.$inferSelect;
