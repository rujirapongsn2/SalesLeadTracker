import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, leadStatusEnum, leadSourceEnum, insertUserSchema, User } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import express from "express";

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
  try {
    // First check if headers-based authentication is used
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];
    const userName = req.headers['x-user-name'];
    
    // If headers are present and valid, use them
    if (userId && userRole && userName) {
      (req as any).user = {
        id: Number(userId),
        role: userRole as string,
        name: userName as string
      };
      
      return next();
    }
    
    // For testing/development: use admin user
    // This bypasses authentication temporarily for testing
    const adminUser = await storage.getUser(1); // Admin user has ID 1
    
    if (adminUser) {
      // Add admin user info to request for downstream use
      (req as any).user = {
        id: adminUser.id,
        role: adminUser.role,
        name: adminUser.name
      };
      
      return next();
    }
    
    // If no method works, authentication has failed
    return res.status(401).json({ message: "Authentication required" });
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
  // API v1 routes
  const v1Router = express.Router();

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

  // Leads routes
  v1Router.get("/leads", async (req: Request, res: Response) => {
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

  v1Router.get("/leads/search", async (req: Request, res: Response) => {
    try {
      const { product } = req.query;
      if (!product) {
        return res.status(400).json({ message: "Product parameter is required" });
      }

      const leads = await storage.searchLeadsByProduct(product as string);
      res.json({ leads });
    } catch (error) {
      res.status(500).json({ message: "Failed to search leads" });
    }
  });

  v1Router.get("/leads/:id", async (req: Request, res: Response) => {
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

  v1Router.post("/leads", async (req: Request, res: Response) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const now = Date.now();
      const enrichedLeadData = {
        ...leadData,
        createdAt: now,
        updatedAt: now,
        createdBy: "API User",
        createdById: 0
      };
      
      const lead = await storage.createLead(enrichedLeadData);
      res.status(201).json({ lead });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  v1Router.patch("/leads/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }

      const lead = await storage.getLeadById(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      const updates = req.body;
      const updatedLead = await storage.updateLead(id, updates);
      res.json({ lead: updatedLead });
    } catch (error) {
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  v1Router.delete("/leads/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }

      const lead = await storage.getLeadById(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      await storage.deleteLead(id);
      res.json({ message: "Lead deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Mount v1 router
  app.use("/api/v1", v1Router);

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

  // Delete user
  app.delete("/api/users/:id", isAuthenticated, hasRole(['Administrator']), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Check if the user exists
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Attempt to delete the user
      try {
        const success = await storage.deleteUser(id);
        if (!success) {
          return res.status(400).json({ message: "Failed to delete user" });
        }
      } catch (err: any) {
        // If error is thrown for last admin, return 400 with message
        return res.status(400).json({ message: err.message || "Failed to delete user" });
      }

      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

// Update user
  app.patch("/api/users/:id", isAuthenticated, hasRole(['Administrator', 'Sales Manager']), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if the user exists
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user data
      const updatedUser = await storage.updateUser(id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password before sending to client
      const { password, ...safeUser } = updatedUser;
      res.status(200).json(safeUser);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update user" });
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
  
  // API Keys management (Admin only)
  app.get("/api/api-keys", isAuthenticated, hasRole(['Administrator']), async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const apiKeys = await storage.getApiKeys(userId);
      
      // แสดง API Key เต็มจำนวน
      const safeKeys = apiKeys.map(key => ({
        ...key,
        key: key.key
      }));
      
      res.json({ apiKeys: safeKeys });
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  // Get full API key by ID
  app.get("/api/api-keys/:id/full", isAuthenticated, hasRole(['Administrator']), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid API key ID" });
      }
      
      const apiKey = await storage.getApiKeyById(id);
      if (!apiKey) {
        return res.status(404).json({ message: "API key not found" });
      }
      
      res.json({ apiKey });
    } catch (error) {
      console.error("Error fetching API key:", error);
      res.status(500).json({ message: "Failed to fetch API key" });
    }
  });
  
  app.post("/api/api-keys", isAuthenticated, hasRole(['Administrator']), async (req: Request, res: Response) => {
    try {
      const { name, userId } = req.body;
      
      if (!name || !userId) {
        return res.status(400).json({ message: "Name and userId are required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const apiKey = await storage.createApiKey({ name, userId });
      
      res.status(201).json({ 
        apiKey,
        message: "API key created successfully. Please save this key as it won't be shown again."
      });
    } catch (error) {
      console.error("Error creating API key:", error);
      res.status(500).json({ message: "Failed to create API key" });
    }
  });
  
  app.delete("/api/api-keys/:id", isAuthenticated, hasRole(['Administrator']), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid API key ID" });
      }
      
      const apiKey = await storage.getApiKeyById(id);
      if (!apiKey) {
        return res.status(404).json({ message: "API key not found" });
      }
      
      const success = await storage.deleteApiKey(id);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete API key" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting API key:", error);
      res.status(500).json({ message: "Failed to delete API key" });
    }
  });
  
  // External API for Lead Search - authenticated with API key
  app.get("/api/v1/leads/search", async (req: Request, res: Response) => {
    try {
      // Check API key authentication
      const apiKey = req.headers['x-api-key'] as string;
      
      if (!apiKey) {
        return res.status(401).json({ message: "API key is required" });
      }
      
      const key = await storage.getApiKeyByKey(apiKey);
      if (!key || !key.isActive) {
        return res.status(401).json({ message: "Invalid or inactive API key" });
      }
      
      // Update last used timestamp
      await storage.updateApiKey(key.id, { lastUsed: new Date() });
      
      // Get search parameters
      const searchParams = {
        name: req.query.name as string | undefined,
        projectName: req.query.projectName as string | undefined,
        endUserOrganization: req.query.endUserOrganization as string | undefined,
        company: req.query.company as string | undefined,
        product: req.query.product as string | undefined
      };
      
      // Perform search
      const leads = await storage.searchLeads(searchParams);
      
      res.json({ leads });
    } catch (error) {
      console.error("Error searching leads:", error);
      res.status(500).json({ message: "Failed to search leads", error: (error as Error).message });
    }
  });
  
  // External API for adding and editing leads - authenticated with API key
  app.post("/api/v1/leads", async (req: Request, res: Response) => {
    try {
      // Check API key authentication
      const apiKey = req.headers['x-api-key'] as string;
      
      if (!apiKey) {
        return res.status(401).json({ message: "API key is required" });
      }
      
      const key = await storage.getApiKeyByKey(apiKey);
      if (!key || !key.isActive) {
        return res.status(401).json({ message: "Invalid or inactive API key" });
      }
      
      // Update last used timestamp
      await storage.updateApiKey(key.id, { lastUsed: new Date() });
      
      // Validate and create the lead
      const leadData = insertLeadSchema.parse(req.body);
      
      // Set the created by information from the API key's user
      const user = await storage.getUser(key.userId);
      if (user) {
        leadData.createdBy = user.name;
        leadData.createdById = user.id;
      }
      
      const lead = await storage.createLead(leadData);
      
      res.status(201).json({ lead });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: "Validation error", errors: validationError.details });
      } else {
        console.error("Error creating lead:", error);
        res.status(500).json({ message: "Failed to create lead", error: (error as Error).message });
      }
    }
  });
  
  app.patch("/api/v1/leads/:id", async (req: Request, res: Response) => {
    try {
      // Check API key authentication
      const apiKey = req.headers['x-api-key'] as string;
      
      if (!apiKey) {
        return res.status(401).json({ message: "API key is required" });
      }
      
      const key = await storage.getApiKeyByKey(apiKey);
      if (!key || !key.isActive) {
        return res.status(401).json({ message: "Invalid or inactive API key" });
      }
      
      // Update last used timestamp
      await storage.updateApiKey(key.id, { lastUsed: new Date() });
      
      // Get the lead ID
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }
      
      // Check if the lead exists
      const existingLead = await storage.getLeadById(id);
      if (!existingLead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      // Update the lead
      const updatedLead = await storage.updateLead(id, req.body);
      if (!updatedLead) {
        return res.status(404).json({ message: "Failed to update lead" });
      }
      
      res.json({ lead: updatedLead });
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ message: "Failed to update lead", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
