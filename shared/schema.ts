import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  source: text("source").notNull(),
  status: text("status").notNull().default("new"),
  product: text("product").notNull().default(""),
  endUserContact: text("end_user_contact").notNull().default(""),
  endUserOrganization: text("end_user_organization").notNull().default(""),
  projectName: text("project_name").notNull().default(""),
  budget: text("budget").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  createdBy: text("created_by").default("Admin User"),
  partnerContact: text("partner_contact").notNull().default(""),
  productRegister: text("product_register").notNull().default(""),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
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

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
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
