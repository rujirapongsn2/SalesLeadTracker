import { 
  leads, 
  type Lead, 
  type InsertLead, 
  users,
  type User,
  type InsertUser
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, and, or, like } from "drizzle-orm";
import Database from "better-sqlite3";

const sqlite = new Database("sqlite.db");
const db = drizzle(sqlite);

export interface IStorage {
  // Lead methods
  getLeads(): Promise<Lead[]>;
  getLeadById(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  deleteAllLeads(): Promise<void>;
  
  // User methods
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  searchUsers(query: string): Promise<User[]>;
}

export class SQLiteStorage implements IStorage {
  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads);
  }

  async getLeadById(id: number): Promise<Lead | undefined> {
    const result = await db.select().from(leads).where(eq(leads.id, id));
    return result[0];
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const result = await db.insert(leads).values(lead).returning();
    return result[0];
  }

  async updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined> {
    const result = await db.update(leads)
      .set(lead)
      .where(eq(leads.id, id))
      .returning();
    return result[0];
  }

  async deleteLead(id: number): Promise<boolean> {
    const result = await db.delete(leads).where(eq(leads.id, id));
    return result !== null;
  }

  async deleteAllLeads(): Promise<void> {
    await db.delete(leads);
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    // Check if username already exists
    const existingUser = await this.getUserByUsername(user.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    const result = await db.insert(users).values({
      ...user,
      avatar: user.avatar || "", // Set default avatar if not provided
    }).returning();
    return result[0];
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    // Check if user exists
    const existingUser = await this.getUser(id);
    if (!existingUser) {
      return undefined;
    }

    // If username is being updated, check if it's already taken
    if (user.username && user.username !== existingUser.username) {
      const usernameExists = await this.getUserByUsername(user.username);
      if (usernameExists) {
        throw new Error("Username already exists");
      }
    }

    const result = await db.update(users)
      .set({
        ...user,
      })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async deleteUser(id: number): Promise<boolean> {
    // Check if user exists
    const existingUser = await this.getUser(id);
    if (!existingUser) {
      return false;
    }

    // Prevent deleting the last admin user
    if (existingUser.role === "Administrator") {
      const adminUsers = await db.select().from(users).where(eq(users.role, "Administrator"));
      if (adminUsers.length <= 1) {
        throw new Error("Cannot delete the last administrator");
      }
    }

    const result = await db.delete(users).where(eq(users.id, id));
    return result !== null;
  }

  async searchUsers(query: string): Promise<User[]> {
    const searchTerm = `%${query}%`;
    return await db.select().from(users).where(
      or(
        like(users.name, searchTerm),
        like(users.username, searchTerm),
        like(users.role, searchTerm)
      )
    );
  }
}

// Create a default admin user
const adminUser: InsertUser = {
  username: "admin",
  password: "admin123", // In a real app, this would be hashed
  name: "Alex Morgan",
  role: "Administrator",
};

export const storage = new SQLiteStorage();

// Initialize the database with sample data
(async () => {
  try {
    // Create admin user if not exists
    const existingAdmin = await storage.getUserByUsername("admin");
    if (!existingAdmin) {
      await storage.createUser(adminUser);
    }

    // Create sample users if no users exist
    const existingUsers = await storage.getUsers();
    if (existingUsers.length <= 1) { // Only admin exists
      const sampleUsers: InsertUser[] = [
        {
          username: "john.doe",
          password: "password123",
          name: "John Doe",
          role: "Sales Manager",
        },
        {
          username: "sarah.smith",
          password: "password123",
          name: "Sarah Smith",
          role: "Sales Representative",
        },
        {
          username: "mike.wilson",
          password: "password123",
          name: "Mike Wilson",
          role: "Sales Representative",
        }
      ];

      for (const user of sampleUsers) {
        await storage.createUser(user);
      }
    }

    // Create sample leads if no leads exist
    const existingLeads = await storage.getLeads();
    if (existingLeads.length === 0) {
      const sampleLeads: InsertLead[] = [
        {
          name: "John Doe",
          company: "Acme Inc.",
          email: "john.doe@example.com",
          phone: "+1 (555) 123-4567",
          source: "Website",
          status: "Qualified",
          product: "Cloud Security Suite",
          endUserContact: "Michael Brown",
          endUserOrganization: "Acme Healthcare",
          projectName: "Security Upgrade 2025",
          budget: "฿8,750,000",
        },
        {
          name: "Sarah Johnson",
          company: "Tech Solutions Ltd.",
          email: "sarah.j@techsolutions.com",
          phone: "+1 (555) 987-6543",
          source: "Referral",
          status: "In Progress",
          product: "Network Monitoring Tools",
          endUserContact: "David Wilson",
          endUserOrganization: "City Government",
          projectName: "Infrastructure Monitoring",
          budget: "฿17,500,000",
        },
        {
          name: "Robert Kim",
          company: "Global Traders",
          email: "rob.kim@globaltraders.net",
          phone: "+1 (555) 456-7890",
          source: "Event",
          status: "New",
          product: "Data Analytics Platform",
          endUserContact: "Jennifer Lee",
          endUserOrganization: "Global Retail Chain",
          projectName: "Sales Analytics Initiative",
          budget: "฿6,125,000",
        },
        {
          name: "Maria Lopez",
          company: "Creative Designs",
          email: "maria@creativedesigns.com",
          phone: "+1 (555) 789-0123",
          source: "Social Media",
          status: "Qualified",
          product: "Creative Suite Pro",
          endUserContact: "Alex Rodriguez",
          endUserOrganization: "Marketing Agency Inc.",
          projectName: "Brand Redesign 2025",
          budget: "฿4,200,000",
        }
      ];

      for (const lead of sampleLeads) {
        await storage.createLead(lead);
      }
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
})();
