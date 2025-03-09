import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertTaskSchema,
  insertEventSchema,
  insertTransactionSchema,
  insertHabitSchema,
  insertHabitCompletionSchema,
  insertContactSchema,
  insertDocumentSchema,
  insertJournalEntrySchema,
  insertWidgetSchema,
  insertCommunityTipSchema,
  insertUserSchema
} from "@shared/schema";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { dirname } from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // HELPER FUNCTIONS
  const validateRequest = <T>(schema: z.ZodType<T>, body: unknown): T => {
    try {
      return schema.parse(body);
    } catch (error) {
      throw { status: 400, message: "Invalid request data" };
    }
  };

  const authenticateRequest = async (req: Request): Promise<number> => {
    // For demo purposes, use a default user ID
    // In a real app, this would validate a session/token
    const user = await storage.getUserByUsername("demo");
    if (!user) {
      throw { status: 401, message: "Authentication required" };
    }
    return user.id;
  };

  // USER ROUTES
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = validateRequest(insertUserSchema, req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      // Don't return the password in the response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, set up a session here
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.get("/api/user/profile", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.patch("/api/user/preferences", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      const { preferences } = req.body;
      
      if (!preferences) {
        return res.status(400).json({ message: "Preferences are required" });
      }
      
      const updatedUser = await storage.updateUser(userId, { preferences });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  // TASK ROUTES
  app.get("/api/tasks", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Ensure the task belongs to the authenticated user
      const userId = await authenticateRequest(req);
      if (task.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(task);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      const taskData = validateRequest(insertTaskSchema, { ...req.body, userId });
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Ensure the task belongs to the authenticated user
      const userId = await authenticateRequest(req);
      if (task.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedTask = await storage.updateTask(taskId, req.body);
      res.json(updatedTask);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Ensure the task belongs to the authenticated user
      const userId = await authenticateRequest(req);
      if (task.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteTask(taskId);
      res.status(204).end();
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  // EVENT ROUTES
  app.get("/api/events", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      const events = await storage.getEvents(userId);
      res.json(events);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      const eventData = validateRequest(insertEventSchema, { ...req.body, userId });
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.patch("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Ensure the event belongs to the authenticated user
      const userId = await authenticateRequest(req);
      if (event.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedEvent = await storage.updateEvent(eventId, req.body);
      res.json(updatedEvent);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Ensure the event belongs to the authenticated user
      const userId = await authenticateRequest(req);
      if (event.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteEvent(eventId);
      res.status(204).end();
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  // TRANSACTION ROUTES
  app.get("/api/transactions", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      const transactionData = validateRequest(insertTransactionSchema, { ...req.body, userId });
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.patch("/api/transactions/:id", async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await storage.getTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Ensure the transaction belongs to the authenticated user
      const userId = await authenticateRequest(req);
      if (transaction.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedTransaction = await storage.updateTransaction(transactionId, req.body);
      res.json(updatedTransaction);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await storage.getTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Ensure the transaction belongs to the authenticated user
      const userId = await authenticateRequest(req);
      if (transaction.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteTransaction(transactionId);
      res.status(204).end();
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  // HABIT ROUTES
  app.get("/api/habits", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      const habits = await storage.getHabits(userId);
      
      // For each habit, get its completions
      const habitsWithCompletions = await Promise.all(
        habits.map(async (habit) => {
          const completions = await storage.getHabitCompletions(habit.id);
          return { ...habit, completions };
        })
      );
      
      res.json(habitsWithCompletions);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.post("/api/habits", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      const habitData = validateRequest(insertHabitSchema, { ...req.body, userId });
      const habit = await storage.createHabit(habitData);
      res.status(201).json(habit);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.patch("/api/habits/:id", async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const habit = await storage.getHabit(habitId);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      // Ensure the habit belongs to the authenticated user
      const userId = await authenticateRequest(req);
      if (habit.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedHabit = await storage.updateHabit(habitId, req.body);
      res.json(updatedHabit);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.delete("/api/habits/:id", async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const habit = await storage.getHabit(habitId);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      // Ensure the habit belongs to the authenticated user
      const userId = await authenticateRequest(req);
      if (habit.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteHabit(habitId);
      res.status(204).end();
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.post("/api/habits/:id/complete", async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const habit = await storage.getHabit(habitId);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      // Ensure the habit belongs to the authenticated user
      const userId = await authenticateRequest(req);
      if (habit.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const date = req.body.date ? new Date(req.body.date) : new Date();
      
      const completionData = validateRequest(
        insertHabitCompletionSchema,
        { habitId, date }
      );
      
      const completion = await storage.createHabitCompletion(completionData);
      res.status(201).json(completion);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  // CONTACT ROUTES
  app.get("/api/contacts", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      const contacts = await storage.getContacts(userId);
      res.json(contacts);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      const contactData = validateRequest(insertContactSchema, { ...req.body, userId });
      const contact = await storage.createContact(contactData);
      res.status(201).json(contact);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.patch("/api/contacts/:id", async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const contact = await storage.getContact(contactId);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      // Ensure the contact belongs to the authenticated user
      const userId = await authenticateRequest(req);
      if (contact.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedContact = await storage.updateContact(contactId, req.body);
      res.json(updatedContact);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const contact = await storage.getContact(contactId);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      // Ensure the contact belongs to the authenticated user
      const userId = await authenticateRequest(req);
      if (contact.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteContact(contactId);
      res.status(204).end();
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  // DOCUMENT ROUTES
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  app.get("/api/documents", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      const documents = await storage.getDocuments(userId);
      res.json(documents);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      
      if (!req.body.name || !req.body.fileContent) {
        return res.status(400).json({ message: "Name and file content are required" });
      }
      
      // In a real app, we'd use multer for file uploads
      // For this simplified version, we'll save the file content
      const fileName = `${randomUUID()}_${req.body.name}`;
      const filePath = path.join(uploadsDir, fileName);
      
      // Convert base64 content to buffer
      const fileContent = req.body.fileContent.split(';base64,').pop();
      fs.writeFileSync(filePath, Buffer.from(fileContent, 'base64'));
      
      const documentData = validateRequest(
        insertDocumentSchema,
        {
          userId,
          name: req.body.name,
          path: filePath,
          type: req.body.type || "document",
          tags: req.body.tags || [],
          uploadDate: new Date()
        }
      );
      
      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Ensure the document belongs to the authenticated user
      const userId = await authenticateRequest(req);
      if (document.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Delete the file
      try {
        fs.unlinkSync(document.path);
      } catch (e) {
        console.error("Error deleting file:", e);
      }
      
      await storage.deleteDocument(documentId);
      res.status(204).end();
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  // JOURNAL ENTRY ROUTES
  app.get("/api/journal", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      const entries = await storage.getJournalEntries(userId);
      res.json(entries);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.post("/api/journal", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      const entryData = validateRequest(
        insertJournalEntrySchema,
        {
          ...req.body,
          userId,
          date: req.body.date ? new Date(req.body.date) : new Date()
        }
      );
      
      const entry = await storage.createJournalEntry(entryData);
      res.status(201).json(entry);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.patch("/api/journal/:id", async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      // Ensure the entry belongs to the authenticated user
      const userId = await authenticateRequest(req);
      if (entry.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedEntry = await storage.updateJournalEntry(entryId, req.body);
      res.json(updatedEntry);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.delete("/api/journal/:id", async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      // Ensure the entry belongs to the authenticated user
      const userId = await authenticateRequest(req);
      if (entry.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteJournalEntry(entryId);
      res.status(204).end();
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  // WIDGET ROUTES
  app.get("/api/widgets", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      const widgets = await storage.getWidgets(userId);
      res.json(widgets);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.post("/api/widgets", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      const widgetData = validateRequest(insertWidgetSchema, { ...req.body, userId });
      const widget = await storage.createWidget(widgetData);
      res.status(201).json(widget);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.patch("/api/widgets/:id", async (req, res) => {
    try {
      const widgetId = parseInt(req.params.id);
      const widget = await storage.getWidget(widgetId);
      
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      // Ensure the widget belongs to the authenticated user
      const userId = await authenticateRequest(req);
      if (widget.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedWidget = await storage.updateWidget(widgetId, req.body);
      res.json(updatedWidget);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.delete("/api/widgets/:id", async (req, res) => {
    try {
      const widgetId = parseInt(req.params.id);
      const widget = await storage.getWidget(widgetId);
      
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      // Ensure the widget belongs to the authenticated user
      const userId = await authenticateRequest(req);
      if (widget.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteWidget(widgetId);
      res.status(204).end();
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.post("/api/widgets/reorder", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      
      if (!req.body.widgetIds || !Array.isArray(req.body.widgetIds)) {
        return res.status(400).json({ message: "widgetIds array is required" });
      }
      
      const updatedWidgets = await storage.updateWidgetOrder(userId, req.body.widgetIds);
      res.json(updatedWidgets);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  // COMMUNITY TIP ROUTES
  app.get("/api/community-tips", async (req, res) => {
    try {
      const tips = await storage.getCommunityTips();
      res.json(tips);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.post("/api/community-tips", async (req, res) => {
    try {
      const userId = await authenticateRequest(req);
      const tipData = validateRequest(
        insertCommunityTipSchema,
        {
          ...req.body,
          userId,
          votes: 0,
          date: new Date()
        }
      );
      
      const tip = await storage.createCommunityTip(tipData);
      res.status(201).json(tip);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.patch("/api/community-tips/:id", async (req, res) => {
    try {
      const tipId = parseInt(req.params.id);
      const tip = await storage.getCommunityTip(tipId);
      
      if (!tip) {
        return res.status(404).json({ message: "Tip not found" });
      }
      
      // Ensure the tip belongs to the authenticated user
      const userId = await authenticateRequest(req);
      if (tip.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedTip = await storage.updateCommunityTip(tipId, req.body);
      res.json(updatedTip);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.delete("/api/community-tips/:id", async (req, res) => {
    try {
      const tipId = parseInt(req.params.id);
      const tip = await storage.getCommunityTip(tipId);
      
      if (!tip) {
        return res.status(404).json({ message: "Tip not found" });
      }
      
      // Ensure the tip belongs to the authenticated user
      const userId = await authenticateRequest(req);
      if (tip.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteCommunityTip(tipId);
      res.status(204).end();
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  app.post("/api/community-tips/:id/vote", async (req, res) => {
    try {
      const tipId = parseInt(req.params.id);
      const tip = await storage.getCommunityTip(tipId);
      
      if (!tip) {
        return res.status(404).json({ message: "Tip not found" });
      }
      
      // Authenticate user
      await authenticateRequest(req);
      
      if (req.body.vote === undefined) {
        return res.status(400).json({ message: "Vote is required (true for upvote, false for downvote)" });
      }
      
      const updatedTip = await storage.voteCommunityTip(tipId, req.body.vote);
      res.json(updatedTip);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  // WEATHER API (for Quick Tools widget)
  app.get("/api/weather", async (req, res) => {
    try {
      // Authenticate user
      await authenticateRequest(req);
      
      // In a real app, this would call an external weather API
      // For this demo, return mock data
      res.json({
        location: "New York, NY",
        temperature: 72,
        condition: "Sunny",
        humidity: 45,
        windSpeed: 5
      });
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });

  return httpServer;
}
