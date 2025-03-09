import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  preferences: jsonb("preferences"), // Theme, dashboard layout, etc.
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  preferences: true,
});

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").notNull().default(false),
  category: text("category"),
  priority: text("priority"),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  userId: true,
  title: true,
  description: true,
  dueDate: true,
  completed: true,
  category: true,
  priority: true,
});

// Event schema
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  color: text("color"),
});

export const insertEventSchema = createInsertSchema(events).pick({
  userId: true,
  title: true,
  description: true, 
  startDate: true,
  endDate: true,
  location: true,
  color: true,
});

// Budget transaction schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(), // In cents
  description: text("description").notNull(),
  category: text("category"),
  date: timestamp("date").notNull(),
  isIncome: boolean("is_income").notNull().default(false),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  description: true,
  category: true,
  date: true,
  isIncome: true,
});

// Habits schema
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  frequency: jsonb("frequency"), // e.g. ["monday", "wednesday", "friday"]
  streak: integer("streak").notNull().default(0),
});

export const insertHabitSchema = createInsertSchema(habits).pick({
  userId: true,
  name: true,
  description: true,
  frequency: true,
  streak: true,
});

// Habit completions
export const habitCompletions = pgTable("habit_completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  date: timestamp("date").notNull(),
});

export const insertHabitCompletionSchema = createInsertSchema(habitCompletions).pick({
  habitId: true,
  date: true,
});

// Contact schema
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  birthday: timestamp("birthday"),
  notes: text("notes"),
  category: text("category"),
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  userId: true,
  name: true,
  email: true,
  phone: true,
  birthday: true,
  notes: true,
  category: true,
});

// Document schema
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  type: text("type"),
  tags: text("tags").array(),
  uploadDate: timestamp("upload_date").notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  userId: true,
  name: true,
  path: true,
  type: true,
  tags: true,
  uploadDate: true,
});

// Journal entry schema
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  mood: text("mood"),
  date: timestamp("date").notNull(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  userId: true,
  content: true,
  mood: true,
  date: true,
});

// Dashboard widget schema
export const widgets = pgTable("widgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // e.g., "tasks", "calendar", "budget"
  position: integer("position").notNull(),
  config: jsonb("config"), // Widget-specific configuration
});

export const insertWidgetSchema = createInsertSchema(widgets).pick({
  userId: true,
  type: true,
  position: true,
  config: true,
});

// Community tip schema
export const communityTips = pgTable("community_tips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  votes: integer("votes").notNull().default(0),
  date: timestamp("date").notNull(),
});

export const insertCommunityTipSchema = createInsertSchema(communityTips).pick({
  userId: true,
  title: true,
  content: true,
  category: true,
  votes: true,
  date: true,
});

// Types based on schemas
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Habit = typeof habits.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;

export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type InsertHabitCompletion = z.infer<typeof insertHabitCompletionSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

export type Widget = typeof widgets.$inferSelect;
export type InsertWidget = z.infer<typeof insertWidgetSchema>;

export type CommunityTip = typeof communityTips.$inferSelect;
export type InsertCommunityTip = z.infer<typeof insertCommunityTipSchema>;
