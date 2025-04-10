import { 
  leads, 
  type Lead, 
  type InsertLead, 
  users,
  type User,
  type InsertUser
} from "@shared/schema";

export interface IStorage {
  // Lead methods
  getLeads(): Promise<Lead[]>;
  getLeadById(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private leads: Map<number, Lead>;
  private users: Map<number, User>;
  private leadId: number;
  private userId: number;

  constructor() {
    this.leads = new Map();
    this.users = new Map();
    this.leadId = 1;
    this.userId = 1;
    
    // Create a default admin user
    const adminUser: User = {
      id: this.userId++,
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      name: "Alex Morgan",
      role: "Administrator",
      avatar: "",
    };
    this.users.set(adminUser.id, adminUser);
    
    // Create some sample leads
    const sampleLeads: InsertLead[] = [
      {
        name: "John Doe",
        company: "Acme Inc.",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        source: "Website",
        status: "Qualified",
      },
      {
        name: "Sarah Johnson",
        company: "Tech Solutions Ltd.",
        email: "sarah.j@techsolutions.com",
        phone: "+1 (555) 987-6543",
        source: "Referral",
        status: "In Progress",
      },
      {
        name: "Robert Kim",
        company: "Global Traders",
        email: "rob.kim@globaltraders.net",
        phone: "+1 (555) 456-7890",
        source: "Event",
        status: "New",
      },
      {
        name: "Maria Lopez",
        company: "Creative Designs",
        email: "maria@creativedesigns.com",
        phone: "+1 (555) 789-0123",
        source: "Social Media",
        status: "Qualified",
      }
    ];
    
    sampleLeads.forEach(lead => {
      const now = new Date();
      const id = this.leadId++;
      this.leads.set(id, {
        ...lead,
        id,
        createdAt: now
      });
    });
  }

  // Lead methods
  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values());
  }

  async getLeadById(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const id = this.leadId++;
    const now = new Date();
    const newLead: Lead = { ...lead, id, createdAt: now };
    this.leads.set(id, newLead);
    return newLead;
  }

  async updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined> {
    const existingLead = this.leads.get(id);
    if (!existingLead) return undefined;
    
    const updatedLead: Lead = { ...existingLead, ...lead };
    this.leads.set(id, updatedLead);
    return updatedLead;
  }

  async deleteLead(id: number): Promise<boolean> {
    return this.leads.delete(id);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, avatar: "" };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
