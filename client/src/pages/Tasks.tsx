import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Progress
} from '@/components/ui';
import { 
  Plus, 
  Search, 
  CheckSquare, 
  Filter, 
  Calendar as CalendarIcon, 
  Clock, 
  Tag
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function Tasks() {
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    category: '',
    priority: ''
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (task: {
      title: string;
      description?: string;
      dueDate?: string;
      category?: string;
      priority?: string;
    }) => {
      return await apiRequest('POST', '/api/tasks', {
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        completed: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        category: '',
        priority: ''
      });
      setIsAddTaskDialogOpen(false);
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number, completed: boolean }) => {
      return await apiRequest('PATCH', `/api/tasks/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  });

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      createTaskMutation.mutate({
        title: newTask.title,
        description: newTask.description || undefined,
        dueDate: newTask.dueDate || undefined,
        category: newTask.category || undefined,
        priority: newTask.priority || undefined
      });
    }
  };

  const handleTaskToggle = (id: number, completed: boolean) => {
    updateTaskMutation.mutate({ id, completed });
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Filter by search query
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by tab
    if (activeTab === 'completed' && !task.completed) return false;
    if (activeTab === 'pending' && task.completed) return false;
    
    // Filter by category
    if (selectedCategory && task.category !== selectedCategory) {
      return false;
    }
    
    // Filter by priority
    if (selectedPriority && task.priority !== selectedPriority) {
      return false;
    }
    
    return true;
  });

  // Get unique categories and priorities for filters
  const categories = Array.from(new Set(tasks.map(task => task.category).filter(Boolean))) as string[];
  const priorities = Array.from(new Set(tasks.map(task => task.priority).filter(Boolean))) as string[];

  // Calculate completion percentage
  const completedTasks = tasks.filter(task => task.completed);
  const completionPercentage = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Tasks & Goals</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Manage your tasks and track your goals
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => setIsAddTaskDialogOpen(true)}
            className="inline-flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="md:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Task Overview</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                  <Input
                    placeholder="Search tasks..."
                    className="pl-8 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <div className="space-y-4">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                      <div
                        key={task.id}
                        className="flex items-start p-3 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={task.completed}
                          onCheckedChange={(checked) => handleTaskToggle(task.id, checked === true)}
                          className="mt-1"
                        />
                        <div className="ml-3 flex-1">
                          <label
                            htmlFor={`task-${task.id}`}
                            className={cn(
                              "font-medium cursor-pointer",
                              task.completed
                                ? "line-through text-neutral-500 dark:text-neutral-400"
                                : "text-neutral-800 dark:text-neutral-200"
                            )}
                          >
                            {task.title}
                          </label>
                          {task.description && (
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2">
                            {task.dueDate && (
                              <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                {format(new Date(task.dueDate), 'MMM d, yyyy')}
                              </div>
                            )}
                            {task.category && (
                              <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                                <Tag className="h-3 w-3 mr-1" />
                                {task.category}
                              </div>
                            )}
                            {task.priority && (
                              <div className="flex items-center text-xs bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded">
                                <span
                                  className={cn(
                                    "w-2 h-2 rounded-full mr-1",
                                    task.priority === 'high' ? "bg-red-500" :
                                    task.priority === 'medium' ? "bg-amber-500" :
                                    "bg-green-500"
                                  )}
                                />
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                      {searchQuery || selectedCategory || selectedPriority
                        ? "No tasks match your filters"
                        : "No tasks yet. Click 'Add Task' to create one."}
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="pending" className="mt-4">
                <div className="space-y-4">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                      <div
                        key={task.id}
                        className="flex items-start p-3 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <Checkbox
                          id={`pending-task-${task.id}`}
                          checked={task.completed}
                          onCheckedChange={(checked) => handleTaskToggle(task.id, checked === true)}
                          className="mt-1"
                        />
                        <div className="ml-3 flex-1">
                          <label
                            htmlFor={`pending-task-${task.id}`}
                            className="font-medium cursor-pointer text-neutral-800 dark:text-neutral-200"
                          >
                            {task.title}
                          </label>
                          {task.description && (
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2">
                            {task.dueDate && (
                              <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                {format(new Date(task.dueDate), 'MMM d, yyyy')}
                              </div>
                            )}
                            {task.category && (
                              <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                                <Tag className="h-3 w-3 mr-1" />
                                {task.category}
                              </div>
                            )}
                            {task.priority && (
                              <div className="flex items-center text-xs bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded">
                                <span
                                  className={cn(
                                    "w-2 h-2 rounded-full mr-1",
                                    task.priority === 'high' ? "bg-red-500" :
                                    task.priority === 'medium' ? "bg-amber-500" :
                                    "bg-green-500"
                                  )}
                                />
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                      No pending tasks
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="completed" className="mt-4">
                <div className="space-y-4">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                      <div
                        key={task.id}
                        className="flex items-start p-3 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <Checkbox
                          id={`completed-task-${task.id}`}
                          checked={task.completed}
                          onCheckedChange={(checked) => handleTaskToggle(task.id, checked === true)}
                          className="mt-1"
                        />
                        <div className="ml-3 flex-1">
                          <label
                            htmlFor={`completed-task-${task.id}`}
                            className="font-medium cursor-pointer line-through text-neutral-500 dark:text-neutral-400"
                          >
                            {task.title}
                          </label>
                          {task.description && (
                            <p className="mt-1 text-sm line-through text-neutral-500 dark:text-neutral-400">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2">
                            {task.dueDate && (
                              <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                {format(new Date(task.dueDate), 'MMM d, yyyy')}
                              </div>
                            )}
                            {task.category && (
                              <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                                <Tag className="h-3 w-3 mr-1" />
                                {task.category}
                              </div>
                            )}
                            {task.priority && (
                              <div className="flex items-center text-xs bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded">
                                <span
                                  className={cn(
                                    "w-2 h-2 rounded-full mr-1",
                                    task.priority === 'high' ? "bg-red-500" :
                                    task.priority === 'medium' ? "bg-amber-500" :
                                    "bg-green-500"
                                  )}
                                />
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                      No completed tasks
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category-filter">Category</Label>
                <Select
                  value={selectedCategory || ''}
                  onValueChange={(value) => setSelectedCategory(value || null)}
                >
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority-filter">Priority</Label>
                <Select
                  value={selectedPriority || ''}
                  onValueChange={(value) => setSelectedPriority(value || null)}
                >
                  <SelectTrigger id="priority-filter">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Task Completion</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {completedTasks.length}/{tasks.length} ({completionPercentage}%)
                    </span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task and add it to your list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">Description (Optional)</Label>
              <Input
                id="task-description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-due-date">Due Date (Optional)</Label>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-neutral-500" />
                <Input
                  id="task-due-date"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-category">Category (Optional)</Label>
                <Select
                  value={newTask.category}
                  onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                >
                  <SelectTrigger id="task-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-priority">Priority (Optional)</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger id="task-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddTask}
              disabled={!newTask.title.trim() || createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? 'Creating...' : 'Add Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
