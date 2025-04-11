import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, leadStatusEnum, leadSourceEnum, insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for leads
  app.get("/api/leads", async (req: Request, res: Response) => {
    try {
      const { fromDate, toDate } = req.query;
      const leads = await storage.getLeads();
      
      // Filter leads by date range if provided
      let filteredLeads = leads;
      if (fromDate || toDate) {
        filteredLeads = leads.filter(lead => {
          const leadDate = new Date(lead.createdAt || 0);
          
          if (fromDate && toDate) {
            return leadDate >= new Date(fromDate as string) && 
                   leadDate <= new Date(toDate as string);
          } else if (fromDate) {
            return leadDate >= new Date(fromDate as string);
          } else if (toDate) {
            return leadDate <= new Date(toDate as string);
          }
          return true;
        });
      }
      
      res.json({ leads: filteredLeads });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }

      const lead = await storage.getLeadById(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      res.json({ lead });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  app.post("/api/leads", async (req: Request, res: Response) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      res.status(201).json({ lead });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.patch("/api/leads/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }

      // Partial validation
      const leadData = req.body;
      if (leadData.status && !leadStatusEnum.safeParse(leadData.status).success) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      if (leadData.source && !leadSourceEnum.safeParse(leadData.source).success) {
        return res.status(400).json({ message: "Invalid source value" });
      }

      const updatedLead = await storage.updateLead(id, leadData);
      if (!updatedLead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      res.json({ lead: updatedLead });
    } catch (error) {
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }

      const success = await storage.deleteLead(id);
      if (!success) {
        return res.status(404).json({ message: "Lead not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // API endpoints for user management
  app.get("/api/users", async (_req: Request, res: Response) => {
    try {
      // Get all users from the storage using the proper method
      const users = await storage.getUsers();
      
      // Remove sensitive information like passwords before sending to client
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      res.json({ users: safeUsers });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password before sending to client
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Remove password before sending to client
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.delete("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Check if user exists
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Use the proper deleteUser method
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete user" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // API endpoints for lead metrics
  app.get("/api/metrics", async (req: Request, res: Response) => {
    try {
      const { fromDate, toDate } = req.query;
      const allLeads = await storage.getLeads();
      
      // Filter leads by date range if provided
      let leads = allLeads;
      if (fromDate || toDate) {
        leads = allLeads.filter(lead => {
          const leadDate = new Date(lead.createdAt || 0);
          
          if (fromDate && toDate) {
            return leadDate >= new Date(fromDate as string) && 
                   leadDate <= new Date(toDate as string);
          } else if (fromDate) {
            return leadDate >= new Date(fromDate as string);
          } else if (toDate) {
            return leadDate <= new Date(toDate as string);
          }
          return true;
        });
      }
      
      // Calculate lead metrics
      const totalLeads = leads.length;
      const newLeads = leads.filter(lead => lead.status === "New").length;
      const qualifiedLeads = leads.filter(lead => lead.status === "Qualified").length;
      const inProgressLeads = leads.filter(lead => lead.status === "In Progress").length;
      const convertedLeads = leads.filter(lead => lead.status === "Converted").length;
      
      // Calculate conversion rate
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads * 100).toFixed(1) : "0.0";

      // Calculate total budget
      const totalBudget = leads.reduce((sum, lead) => {
        // Extract numeric value from budget string (e.g., "฿8,750,000" -> 8750000)
        if (!lead.budget) return sum;
        const budgetValue = parseFloat(lead.budget.replace(/[^0-9.-]+/g, ""));
        return isNaN(budgetValue) ? sum : sum + budgetValue;
      }, 0);

      // Calculate lead source distribution
      const sources = ["Website", "Referral", "Social Media", "Event", "Other"];
      const sourceDistribution = sources.map(source => ({
        source,
        count: leads.filter(lead => lead.source === source).length,
        percentage: totalLeads > 0 
          ? Math.round(leads.filter(lead => lead.source === source).length / totalLeads * 100) 
          : 0
      }));

      // Calculate status distribution
      const statuses = ["New", "Qualified", "In Progress", "Converted", "Lost"];
      const statusDistribution = statuses.map(status => ({
        status,
        count: leads.filter(lead => lead.status === status).length,
        percentage: totalLeads > 0 
          ? Math.round(leads.filter(lead => lead.status === status).length / totalLeads * 100) 
          : 0
      }));

      res.json({
        metrics: {
          total: totalLeads,
          new: newLeads,
          qualified: qualifiedLeads,
          inProgress: inProgressLeads,
          converted: convertedLeads,
          conversionRate,
          totalBudget
        },
        sourceDistribution,
        statusDistribution
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
