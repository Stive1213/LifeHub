import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea
} from '@/components/ui';
import { 
  Plus, 
  Search, 
  Users, 
  Mail, 
  Phone, 
  User,
  Cake,
  Tag,
  Edit,
  Trash2,
  Filter
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Contact } from '@/lib/types';
import { format } from 'date-fns';

export default function Contacts() {
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    birthday: '',
    notes: '',
    category: ''
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
  });

  const createContactMutation = useMutation({
    mutationFn: async (contact: {
      name: string;
      email?: string;
      phone?: string;
      birthday?: string;
      notes?: string;
      category?: string;
    }) => {
      return await apiRequest('POST', '/api/contacts', {
        ...contact,
        birthday: contact.birthday ? new Date(contact.birthday) : undefined
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setNewContact({
        name: '',
        email: '',
        phone: '',
        birthday: '',
        notes: '',
        category: ''
      });
      setIsAddContactDialogOpen(false);
    }
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/contacts/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
    }
  });

  const handleAddContact = () => {
    if (newContact.name.trim()) {
      createContactMutation.mutate({
        name: newContact.name,
        email: newContact.email || undefined,
        phone: newContact.phone || undefined,
        birthday: newContact.birthday || undefined,
        notes: newContact.notes || undefined,
        category: newContact.category || undefined
      });
    }
  };

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    // Filter by search query
    if (searchQuery && !contact.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (categoryFilter && contact.category !== categoryFilter) {
      return false;
    }
    
    return true;
  });

  // Get unique categories for filters
  const categories = Array.from(new Set(contacts.map(contact => contact.category).filter(Boolean))) as string[];

  // Group contacts by first letter for "all" tab
  const groupedContacts = filteredContacts.reduce((groups, contact) => {
    const firstLetter = contact.name.charAt(0).toUpperCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }
    groups[firstLetter].push(contact);
    return groups;
  }, {} as Record<string, Contact[]>);

  // Sort letters alphabetically
  const sortedLetters = Object.keys(groupedContacts).sort();

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Contacts</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Manage your contacts and connections
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => setIsAddContactDialogOpen(true)}
            className="inline-flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="md:col-span-3">
          <CardHeader className="pb-3 flex flex-col md:flex-row justify-between items-start md:items-center">
            <CardTitle>Contact List</CardTitle>
            <div className="flex items-center space-x-2 mt-3 md:mt-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-8 w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Contacts</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                {filteredContacts.length > 0 ? (
                  <div className="space-y-6">
                    {sortedLetters.map(letter => (
                      <div key={letter}>
                        <h3 className="text-sm font-semibold mb-2 text-neutral-500 dark:text-neutral-400">
                          {letter}
                        </h3>
                        <div className="space-y-2">
                          {groupedContacts[letter].map(contact => (
                            <div
                              key={contact.id}
                              className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 flex justify-between items-center"
                            >
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 flex items-center justify-center font-semibold">
                                  {contact.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-3">
                                  <div className="font-medium">{contact.name}</div>
                                  <div className="text-sm text-neutral-500 dark:text-neutral-400 flex flex-wrap gap-2">
                                    {contact.email && (
                                      <span className="flex items-center">
                                        <Mail className="h-3 w-3 mr-1" />
                                        {contact.email}
                                      </span>
                                    )}
                                    {contact.phone && (
                                      <span className="flex items-center">
                                        <Phone className="h-3 w-3 mr-1" />
                                        {contact.phone}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {contact.category && (
                                  <span className="px-2 py-1 rounded-md text-xs bg-neutral-100 dark:bg-neutral-800">
                                    {contact.category}
                                  </span>
                                )}
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-red-500 hover:text-red-600"
                                  onClick={() => deleteContactMutation.mutate(contact.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">
                    {searchQuery || categoryFilter
                      ? "No contacts match your filters"
                      : "No contacts yet. Click 'Add Contact' to create one."}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="favorites" className="mt-4">
                <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">
                  Favorites feature coming soon
                </div>
              </TabsContent>
              <TabsContent value="recent" className="mt-4">
                <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">
                  Recent contacts feature coming soon
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div 
                  className={`px-3 py-2 rounded-md cursor-pointer ${categoryFilter === null ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                  onClick={() => setCategoryFilter(null)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">All Categories</span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{contacts.length}</span>
                  </div>
                </div>
                {categories.map(category => (
                  <div 
                    key={category}
                    className={`px-3 py-2 rounded-md cursor-pointer ${categoryFilter === category ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                    onClick={() => setCategoryFilter(category)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category}</span>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {contacts.filter(c => c.category === category).length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cake className="h-5 w-5 mr-2" />
                Upcoming Birthdays
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contacts.filter(c => c.birthday).length > 0 ? (
                <div className="space-y-3">
                  {contacts
                    .filter(c => c.birthday)
                    .sort((a, b) => {
                      // Sort by upcoming birthdays
                      const now = new Date();
                      const aDate = new Date(a.birthday as string);
                      const bDate = new Date(b.birthday as string);
                      
                      // Set to current year for comparison
                      aDate.setFullYear(now.getFullYear());
                      bDate.setFullYear(now.getFullYear());
                      
                      // If already passed, add a year
                      if (aDate < now) aDate.setFullYear(now.getFullYear() + 1);
                      if (bDate < now) bDate.setFullYear(now.getFullYear() + 1);
                      
                      return aDate.getTime() - bDate.getTime();
                    })
                    .slice(0, 5)
                    .map(contact => (
                      <div key={contact.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 flex items-center justify-center font-semibold text-sm">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="ml-2 font-medium">{contact.name}</span>
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {format(new Date(contact.birthday as string), 'MMM d')}
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div className="text-center py-4 text-neutral-500 dark:text-neutral-400">
                  No birthdays to display
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isAddContactDialogOpen} onOpenChange={setIsAddContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Create a new contact in your address book.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Enter contact name"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email (Optional)</Label>
              <Input
                id="contact-email"
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Phone (Optional)</Label>
              <Input
                id="contact-phone"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-birthday">Birthday (Optional)</Label>
              <Input
                id="contact-birthday"
                type="date"
                value={newContact.birthday}
                onChange={(e) => setNewContact({ ...newContact, birthday: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-category">Category (Optional)</Label>
              <Input
                id="contact-category"
                value={newContact.category}
                onChange={(e) => setNewContact({ ...newContact, category: e.target.value })}
                placeholder="e.g., Family, Work, Friend"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-notes">Notes (Optional)</Label>
              <Textarea
                id="contact-notes"
                value={newContact.notes}
                onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                placeholder="Add some notes about this contact"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddContactDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddContact}
              disabled={!newContact.name.trim() || createContactMutation.isPending}
            >
              {createContactMutation.isPending ? 'Creating...' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
