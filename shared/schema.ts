import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  source: text("source").notNull(),
  status: text("status").notNull().default("New"),
  product: text("product").notNull().default(""),
  endUserContact: text("end_user_contact").notNull().default(""),
  endUserOrganization: text("end_user_organization").notNull().default(""),
  projectName: text("project_name").notNull().default(""),
  budget: text("budget").notNull().default(""),
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at"),
  createdBy: text("created_by").default("Admin User"),
  createdById: integer("created_by_id").default(0),
  partnerContact: text("partner_contact").notNull().default(""),
  productRegister: text("product_register").notNull().default(""),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
});

export const leadSourceEnum = z.enum([
  "Website",
  "Referral",
  "Social Media",
  "Event",
  "Other",
  "Other (Custom)",
]);

export const leadStatusEnum = z.enum([
  "New",
  "Qualified",
  "In Progress",
  "Converted",
  "Lost",
]);

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type LeadSource = z.infer<typeof leadSourceEnum>;
export type LeadStatus = z.infer<typeof leadStatusEnum>;

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
  avatar: text("avatar").notNull().default(""),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
  avatar: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// API Keys
export const apiKeys = sqliteTable("api_keys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  lastUsed: integer("last_used", { mode: "timestamp" }),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  name: true,
  userId: true,
});

export const apiKeySchema = z.object({
  id: z.number(),
  key: z.string(),
  name: z.string(),
  userId: z.number(),
  createdAt: z.date(),
  lastUsed: z.date().optional().nullable(),
  isActive: z.boolean(),
});

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
