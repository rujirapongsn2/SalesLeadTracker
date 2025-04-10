import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, leadStatusEnum, leadSourceEnum } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for leads
  app.get("/api/leads", async (_req: Request, res: Response) => {
    try {
      const leads = await storage.getLeads();
      res.json({ leads });
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

  // API endpoints for lead metrics
  app.get("/api/metrics", async (_req: Request, res: Response) => {
    try {
      const leads = await storage.getLeads();
      
      // Calculate lead metrics
      const totalLeads = leads.length;
      const newLeads = leads.filter(lead => lead.status === "New").length;
      const qualifiedLeads = leads.filter(lead => lead.status === "Qualified").length;
      const inProgressLeads = leads.filter(lead => lead.status === "In Progress").length;
      const convertedLeads = leads.filter(lead => lead.status === "Converted").length;
      
      // Calculate conversion rate
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads * 100).toFixed(1) : "0.0";

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
          conversionRate
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
