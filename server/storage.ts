import { 
  leads, 
  type Lead, 
  type InsertLead, 
  users,
  type User,
  type InsertUser,
  apiKeys,
  type ApiKey,
  type InsertApiKey
} from "@shared/schema";
import { randomBytes } from "crypto";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, and, or, like, sql } from "drizzle-orm";
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
  searchLeads(searchParams: { 
    name?: string;
    projectName?: string;
    endUserOrganization?: string;
    company?: string;
  }): Promise<Lead[]>;
  searchLeadsByProduct(product: string): Promise<Lead[]>;
  
  // User methods
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  searchUsers(query: string): Promise<User[]>;
  
  // API Key methods
  getApiKeys(userId?: number): Promise<ApiKey[]>;
  getApiKeyById(id: number): Promise<ApiKey | undefined>;
  getApiKeyByKey(key: string): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: number, apiKey: Partial<ApiKey>): Promise<ApiKey | undefined>;
  deleteApiKey(id: number): Promise<boolean>;
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
  
  async searchLeads(searchParams: { 
    keyword?: string;
    name?: string;
    projectName?: string;
    endUserOrganization?: string;
    company?: string;
    product?: string;
  }): Promise<Lead[]> {
    // If keyword is provided, search across all relevant fields
    if (searchParams.keyword) {
      const keyword = `%${searchParams.keyword}%`;
      return await db
        .select()
        .from(leads)
        .where(
          or(
            like(leads.name, keyword),
            like(leads.projectName, keyword),
            like(leads.company, keyword),
            like(leads.endUserOrganization, keyword),
            like(leads.product, keyword),
            like(leads.email, keyword),
            like(leads.phone, keyword),
            like(leads.endUserContact, keyword)
          )
        );
    }
    
    // Individual field searches (for backward compatibility)
    const conditions = [];
    
    if (searchParams.name) {
      conditions.push(like(leads.name, `%${searchParams.name}%`));
    }
    
    if (searchParams.projectName) {
      conditions.push(like(leads.projectName, `%${searchParams.projectName}%`));
    }
    
    if (searchParams.endUserOrganization) {
      conditions.push(like(leads.endUserOrganization, `%${searchParams.endUserOrganization}%`));
    }
    
    if (searchParams.company) {
      conditions.push(like(leads.company, `%${searchParams.company}%`));
    }
    
    if (searchParams.product) {
      conditions.push(like(leads.product, `%${searchParams.product}%`));
    }
    
    if (conditions.length === 0) {
      return await db.select().from(leads);
    }
    
    return await db
      .select()
      .from(leads)
      .where(and(...conditions));
  }

  async searchLeadsByProduct(product: string): Promise<Lead[]> {
    const searchResults = await db.select()
      .from(leads)
      .where(sql`LOWER(product_register) LIKE LOWER(${'%' + product + '%'}) OR LOWER(product) LIKE LOWER(${'%' + product + '%'})`)
      .all();
    return searchResults;
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
  
  // API Key methods
  async getApiKeys(userId?: number): Promise<ApiKey[]> {
    if (userId) {
      return await db.select().from(apiKeys).where(eq(apiKeys.userId, userId));
    }
    return await db.select().from(apiKeys);
  }
  
  async getApiKeyById(id: number): Promise<ApiKey | undefined> {
    const result = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
    return result[0];
  }
  
  async getApiKeyByKey(key: string): Promise<ApiKey | undefined> {
    const result = await db.select().from(apiKeys).where(eq(apiKeys.key, key));
    return result[0];
  }
  
  async createApiKey(apiKeyData: InsertApiKey): Promise<ApiKey> {
    // Generate a random API key
    const keyBuffer = randomBytes(32);
    const key = keyBuffer.toString('hex');
    
    const result = await db.insert(apiKeys).values({
      ...apiKeyData,
      key,
      isActive: true,
      createdAt: new Date(),
    }).returning();
    
    return result[0];
  }
  
  async updateApiKey(id: number, apiKeyData: Partial<ApiKey>): Promise<ApiKey | undefined> {
    const existingKey = await this.getApiKeyById(id);
    if (!existingKey) {
      return undefined;
    }
    
    const result = await db.update(apiKeys)
      .set(apiKeyData)
      .where(eq(apiKeys.id, id))
      .returning();
      
    return result[0];
  }
  
  async deleteApiKey(id: number): Promise<boolean> {
    const result = await db.delete(apiKeys).where(eq(apiKeys.id, id));
    return result !== null;
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
