import {
  User, InsertUser, users,
  Task, InsertTask, tasks,
  Event, InsertEvent, events,
  Transaction, InsertTransaction, transactions,
  Habit, InsertHabit, habits,
  HabitCompletion, InsertHabitCompletion, habitCompletions,
  Contact, InsertContact, contacts, 
  Document, InsertDocument, documents,
  JournalEntry, InsertJournalEntry, journalEntries,
  Widget, InsertWidget, widgets,
  CommunityTip, InsertCommunityTip, communityTips
} from "@shared/schema";

// Define the storage interface with CRUD operations for all entities
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;

  // Task operations
  getTasks(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, data: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Event operations
  getEvents(userId: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;

  // Transaction operations
  getTransactions(userId: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, data: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;

  // Habit operations
  getHabits(userId: number): Promise<Habit[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, data: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<boolean>;

  // Habit completion operations
  getHabitCompletions(habitId: number): Promise<HabitCompletion[]>;
  createHabitCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion>;
  deleteHabitCompletion(id: number): Promise<boolean>;

  // Contact operations
  getContacts(userId: number): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, data: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;

  // Document operations
  getDocuments(userId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, data: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;

  // Journal entry operations
  getJournalEntries(userId: number): Promise<JournalEntry[]>;
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, data: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number): Promise<boolean>;

  // Widget operations
  getWidgets(userId: number): Promise<Widget[]>;
  getWidget(id: number): Promise<Widget | undefined>;
  createWidget(widget: InsertWidget): Promise<Widget>;
  updateWidget(id: number, data: Partial<InsertWidget>): Promise<Widget | undefined>;
  deleteWidget(id: number): Promise<boolean>;
  updateWidgetOrder(userId: number, widgetIds: number[]): Promise<Widget[]>;

  // Community tip operations
  getCommunityTips(): Promise<CommunityTip[]>;
  getCommunityTip(id: number): Promise<CommunityTip | undefined>;
  createCommunityTip(tip: InsertCommunityTip): Promise<CommunityTip>;
  updateCommunityTip(id: number, data: Partial<InsertCommunityTip>): Promise<CommunityTip | undefined>;
  deleteCommunityTip(id: number): Promise<boolean>;
  voteCommunityTip(id: number, increment: boolean): Promise<CommunityTip | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private events: Map<number, Event>;
  private transactions: Map<number, Transaction>;
  private habits: Map<number, Habit>;
  private habitCompletions: Map<number, HabitCompletion>;
  private contacts: Map<number, Contact>;
  private documents: Map<number, Document>;
  private journalEntries: Map<number, JournalEntry>;
  private widgets: Map<number, Widget>;
  private communityTips: Map<number, CommunityTip>;

  private userId: number = 1;
  private taskId: number = 1;
  private eventId: number = 1;
  private transactionId: number = 1;
  private habitId: number = 1;
  private habitCompletionId: number = 1;
  private contactId: number = 1;
  private documentId: number = 1;
  private journalEntryId: number = 1;
  private widgetId: number = 1;
  private communityTipId: number = 1;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.events = new Map();
    this.transactions = new Map();
    this.habits = new Map();
    this.habitCompletions = new Map();
    this.contacts = new Map();
    this.documents = new Map();
    this.journalEntries = new Map();
    this.widgets = new Map();
    this.communityTips = new Map();

    // Add a demo user
    this.createUser({
      username: "demo",
      password: "password",
      displayName: "Demo User",
      email: "demo@example.com",
      preferences: { theme: "light", widgets: ["tasks", "calendar", "budget"] }
    });
  }

  // User Operations
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    
    // Create default widgets for new user
    const defaultWidgets = [
      { type: "tasks", position: 0 },
      { type: "calendar", position: 1 },
      { type: "budget", position: 2 },
      { type: "habits", position: 3 },
      { type: "journal", position: 4 },
      { type: "quickTools", position: 5 }
    ];
    
    defaultWidgets.forEach(widget => {
      this.createWidget({
        userId: id,
        type: widget.type,
        position: widget.position,
        config: {}
      });
    });
    
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Task Operations
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const newTask: Task = { ...task, id };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, data: Partial<InsertTask>): Promise<Task | undefined> {
    const task = await this.getTask(id);
    if (!task) return undefined;

    const updatedTask = { ...task, ...data };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Event Operations
  async getEvents(userId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.userId === userId);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const newEvent: Event = { ...event, id };
    this.events.set(id, newEvent);
    return newEvent;
  }

  async updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = await this.getEvent(id);
    if (!event) return undefined;

    const updatedEvent = { ...event, ...data };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Transaction Operations
  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(transaction => transaction.userId === userId);
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const newTransaction: Transaction = { ...transaction, id };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async updateTransaction(id: number, data: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = await this.getTransaction(id);
    if (!transaction) return undefined;

    const updatedTransaction = { ...transaction, ...data };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // Habit Operations
  async getHabits(userId: number): Promise<Habit[]> {
    return Array.from(this.habits.values()).filter(habit => habit.userId === userId);
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async createHabit(habit: InsertHabit): Promise<Habit> {
    const id = this.habitId++;
    const newHabit: Habit = { ...habit, id };
    this.habits.set(id, newHabit);
    return newHabit;
  }

  async updateHabit(id: number, data: Partial<InsertHabit>): Promise<Habit | undefined> {
    const habit = await this.getHabit(id);
    if (!habit) return undefined;

    const updatedHabit = { ...habit, ...data };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<boolean> {
    return this.habits.delete(id);
  }

  // Habit Completion Operations
  async getHabitCompletions(habitId: number): Promise<HabitCompletion[]> {
    return Array.from(this.habitCompletions.values()).filter(completion => completion.habitId === habitId);
  }

  async createHabitCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion> {
    const id = this.habitCompletionId++;
    const newCompletion: HabitCompletion = { ...completion, id };
    this.habitCompletions.set(id, newCompletion);
    
    // Update habit streak
    const habit = await this.getHabit(completion.habitId);
    if (habit) {
      await this.updateHabit(habit.id, { streak: habit.streak + 1 });
    }
    
    return newCompletion;
  }

  async deleteHabitCompletion(id: number): Promise<boolean> {
    const completion = this.habitCompletions.get(id);
    if (!completion) return false;
    
    // Decrement streak if needed
    const habit = await this.getHabit(completion.habitId);
    if (habit && habit.streak > 0) {
      await this.updateHabit(habit.id, { streak: habit.streak - 1 });
    }
    
    return this.habitCompletions.delete(id);
  }

  // Contact Operations
  async getContacts(userId: number): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(contact => contact.userId === userId);
  }

  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.contactId++;
    const newContact: Contact = { ...contact, id };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async updateContact(id: number, data: Partial<InsertContact>): Promise<Contact | undefined> {
    const contact = await this.getContact(id);
    if (!contact) return undefined;

    const updatedContact = { ...contact, ...data };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }

  // Document Operations
  async getDocuments(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(document => document.userId === userId);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.documentId++;
    const newDocument: Document = { ...document, id };
    this.documents.set(id, newDocument);
    return newDocument;
  }

  async updateDocument(id: number, data: Partial<InsertDocument>): Promise<Document | undefined> {
    const document = await this.getDocument(id);
    if (!document) return undefined;

    const updatedDocument = { ...document, ...data };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Journal Entry Operations
  async getJournalEntries(userId: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values()).filter(entry => entry.userId === userId);
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.journalEntryId++;
    const newEntry: JournalEntry = { ...entry, id };
    this.journalEntries.set(id, newEntry);
    return newEntry;
  }

  async updateJournalEntry(id: number, data: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const entry = await this.getJournalEntry(id);
    if (!entry) return undefined;

    const updatedEntry = { ...entry, ...data };
    this.journalEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    return this.journalEntries.delete(id);
  }

  // Widget Operations
  async getWidgets(userId: number): Promise<Widget[]> {
    return Array.from(this.widgets.values())
      .filter(widget => widget.userId === userId)
      .sort((a, b) => a.position - b.position);
  }

  async getWidget(id: number): Promise<Widget | undefined> {
    return this.widgets.get(id);
  }

  async createWidget(widget: InsertWidget): Promise<Widget> {
    const id = this.widgetId++;
    const newWidget: Widget = { ...widget, id };
    this.widgets.set(id, newWidget);
    return newWidget;
  }

  async updateWidget(id: number, data: Partial<InsertWidget>): Promise<Widget | undefined> {
    const widget = await this.getWidget(id);
    if (!widget) return undefined;

    const updatedWidget = { ...widget, ...data };
    this.widgets.set(id, updatedWidget);
    return updatedWidget;
  }

  async deleteWidget(id: number): Promise<boolean> {
    return this.widgets.delete(id);
  }
  
  async updateWidgetOrder(userId: number, widgetIds: number[]): Promise<Widget[]> {
    const userWidgets = await this.getWidgets(userId);
    
    // Ensure all widget IDs exist and belong to the user
    const validWidgetIds = userWidgets.map(w => w.id);
    const allIdsValid = widgetIds.every(id => validWidgetIds.includes(id));
    
    if (!allIdsValid) {
      throw new Error("Invalid widget IDs provided");
    }
    
    // Update positions
    for (let i = 0; i < widgetIds.length; i++) {
      const widgetId = widgetIds[i];
      const widget = await this.getWidget(widgetId);
      if (widget) {
        await this.updateWidget(widgetId, { position: i });
      }
    }
    
    return this.getWidgets(userId);
  }

  // Community Tip Operations
  async getCommunityTips(): Promise<CommunityTip[]> {
    return Array.from(this.communityTips.values());
  }

  async getCommunityTip(id: number): Promise<CommunityTip | undefined> {
    return this.communityTips.get(id);
  }

  async createCommunityTip(tip: InsertCommunityTip): Promise<CommunityTip> {
    const id = this.communityTipId++;
    const newTip: CommunityTip = { ...tip, id };
    this.communityTips.set(id, newTip);
    return newTip;
  }

  async updateCommunityTip(id: number, data: Partial<InsertCommunityTip>): Promise<CommunityTip | undefined> {
    const tip = await this.getCommunityTip(id);
    if (!tip) return undefined;

    const updatedTip = { ...tip, ...data };
    this.communityTips.set(id, updatedTip);
    return updatedTip;
  }

  async deleteCommunityTip(id: number): Promise<boolean> {
    return this.communityTips.delete(id);
  }
  
  async voteCommunityTip(id: number, increment: boolean): Promise<CommunityTip | undefined> {
    const tip = await this.getCommunityTip(id);
    if (!tip) return undefined;
    
    const updatedVotes = increment ? tip.votes + 1 : tip.votes - 1;
    const updatedTip = await this.updateCommunityTip(id, { votes: updatedVotes });
    return updatedTip;
  }
}

export const storage = new MemStorage();
