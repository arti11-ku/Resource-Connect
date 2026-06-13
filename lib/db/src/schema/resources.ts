import { pgTable, serial, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ngosTable } from "./ngos";

export const resourceStatusEnum = pgEnum("resource_status", ["available", "allocated", "depleted"]);
export const resourceCategoryEnum = pgEnum("resource_category", ["Food", "Water", "Medical", "Shelter", "Clothing", "Other"]);

export const resourcesTable = pgTable("resources", {
  id: serial("id").primaryKey(),
  ngoId: integer("ngo_id").references(() => ngosTable.id),
  resourceName: text("resource_name").notNull(),
  category: resourceCategoryEnum("category").notNull(),
  quantity: integer("quantity").notNull().default(0),
  unit: text("unit").notNull().default("units"),
  location: text("location"),
  status: resourceStatusEnum("status").notNull().default("available"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertResourceSchema = createInsertSchema(resourcesTable).omit({ id: true, updatedAt: true });
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resourcesTable.$inferSelect;
