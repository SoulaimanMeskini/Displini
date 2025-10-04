import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { parseUserCommand } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/auth/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { dateOfBirth } = req.body;
      
      if (dateOfBirth) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateOfBirth)) {
          return res.status(400).json({ message: "Invalid date format. Expected YYYY-MM-DD" });
        }
        
        const date = new Date(dateOfBirth);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ message: "Invalid date value" });
        }
      }
      
      const user = await storage.updateUserProfile(userId, { dateOfBirth });
      res.json(user);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post('/api/ai/parse', isAuthenticated, async (req: any, res) => {
    try {
      const { input } = req.body;
      
      if (!input || typeof input !== 'string') {
        return res.status(400).json({ message: "Invalid input" });
      }
      
      const result = await parseUserCommand(input);
      res.json(result);
    } catch (error) {
      console.error("Error parsing command:", error);
      res.status(500).json({ message: "Failed to parse command" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
