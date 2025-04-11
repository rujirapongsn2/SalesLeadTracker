import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, leadStatusEnum, leadSourceEnum, insertUserSchema, User } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";

// Define login schema
const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

// Role hierarchy for permission checking
const roleHierarchy: Record<string, number> = {
  'Administrator': 3,
  'Sales Manager': 2,
  'Sales Representative': 1,
};

// Middleware to check if user is authenticated
const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  // In a real app, this would validate a JWT token or session
  // For this example, we'll use custom headers for authentication
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  const userName = req.headers['x-user-name'];
  
  if (!userId || !userRole || !userName) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  try {
    // Add user info to request object for use in route handlers
    (req as any).user = {
      id: Number(userId),
      role: userRole as string,
      name: userName as string
    };
    
    // In a real app, we would validate the user against the database
    // For this example, we'll just use the headers directly
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};

// Middleware to check if user has required role
const hasRole = (requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as User;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const userRoleLevel = roleHierarchy[user.role] || 0;
    
    // Check if user's role level is sufficient for any of the required roles
    const hasPermission = requiredRoles.some(role => {
      const requiredLevel = roleHierarchy[role] || 0;
      return userRoleLevel >= requiredLevel;
    });
    
    if (!hasPermission) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Login endpoint
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid username or password" 
        });
      }
      
      // In a real app, you would generate and return a JWT token here
      // For simplicity, we'll just return the user object (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ 
        success: true, 
        user: userWithoutPassword,
        message: "Login successful"
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      }
      res.status(500).json({ 
        success: false, 
        message: "Login failed" 
      });
    }
  });
  // API routes for leads
  app.get("/api/leads", isAuthenticated, async (req: Request, res: Response) => {
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

  app.get("/api/leads/:id", isAuthenticated, async (req: Request, res: Response) => {
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

  app.post("/api/leads", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user info from authentication middleware
      const user = (req as any).user;
      
      // Parse the request body with Zod schema
      const leadData = insertLeadSchema.parse(req.body);
      
      // Add timestamps and creator info
      const now = Date.now();
      const enrichedLeadData = {
        ...leadData,
        createdAt: now,
        updatedAt: now,
        createdBy: user?.name || 'Unknown User',
        createdById: user?.id || 0
      };
      
      // Create the lead in the database
      const lead = await storage.createLead(enrichedLeadData);
      res.status(201).json({ lead });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating lead:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.patch("/api/leads/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }

      // Get the current user from auth middleware
      const user = (req as any).user;

      // Check if the lead exists
      const existingLead = await storage.getLeadById(id);
      if (!existingLead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      // Check permission: Only allow if user is the creator OR has admin/manager role
      const userRoleLevel = roleHierarchy[user.role] || 0;
      const isAdmin = userRoleLevel >= roleHierarchy['Sales Manager']; // Sales Manager or Administrator
      const isOwner = existingLead.createdById === user.id || existingLead.createdBy === user.name;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ 
          message: "You do not have permission to update this lead. Only the creator, Sales Manager, or Administrator can update it." 
        });
      }

      // Partial validation
      const leadData = req.body;
      if (leadData.status && !leadStatusEnum.safeParse(leadData.status).success) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      if (leadData.source && !leadSourceEnum.safeParse(leadData.source).success) {
        return res.status(400).json({ message: "Invalid source value" });
      }

      // Add updatedAt timestamp
      const updatedLeadData = {
        ...leadData,
        updatedAt: Date.now()
      };

      const updatedLead = await storage.updateLead(id, updatedLeadData);
      if (!updatedLead) {
        return res.status(404).json({ message: "Failed to update lead" });
      }

      res.json({ lead: updatedLead });
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }

      // Get the current user from auth middleware
      const user = (req as any).user;

      // Check if the lead exists
      const existingLead = await storage.getLeadById(id);
      if (!existingLead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      // Check permission: Only allow if user is the creator OR has admin/manager role
      const userRoleLevel = roleHierarchy[user.role] || 0;
      const isAdmin = userRoleLevel >= roleHierarchy['Sales Manager']; // Sales Manager or Administrator
      const isOwner = existingLead.createdById === user.id || existingLead.createdBy === user.name;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ 
          message: "You do not have permission to delete this lead. Only the creator, Sales Manager, or Administrator can delete it." 
        });
      }

      const success = await storage.deleteLead(id);
      if (!success) {
        return res.status(404).json({ message: "Failed to delete lead" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  app.delete("/api/leads", isAuthenticated, hasRole(['Administrator']), async (req: Request, res: Response) => {
    try {
      await storage.deleteAllLeads();
      res.status(200).json({ message: "All leads deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete all leads" });
    }
  });

  // API route for metrics
  // API for metrics moved to a more complete implementation below

  // API endpoints for user management
  app.get("/api/users", isAuthenticated, hasRole(['Administrator', 'Sales Manager']), async (_req: Request, res: Response) => {
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

  app.get("/api/users/:id", isAuthenticated, hasRole(['Administrator', 'Sales Manager']), async (req: Request, res: Response) => {
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

  app.post("/api/users", isAuthenticated, hasRole(['Administrator']), async (req: Request, res: Response) => {
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

  // API endpoints for lead metrics
  app.get("/api/metrics", isAuthenticated, async (req: Request, res: Response) => {
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

      // Send data directly in the format expected by the component
      res.json({
        totalLeads,
        statusDistribution,
        sourceDistribution,
        // Include metrics for other components that might need it
        metrics: {
          total: totalLeads,
          new: newLeads,
          qualified: qualifiedLeads,
          inProgress: inProgressLeads,
          converted: convertedLeads,
          conversionRate,
          totalBudget
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
