import { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { MoreHorizontal, CheckSquare, Plus } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Task } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TaskWidget() {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  const completedTasks = tasks.filter(task => task.completed);
  const completionPercentage = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number, completed: boolean }) => {
      return await apiRequest('PATCH', `/api/tasks/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      return await apiRequest('POST', '/api/tasks', { title, completed: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setNewTaskTitle('');
      setIsAddTaskDialogOpen(false);
    }
  });

  const handleTaskToggle = (id: number, completed: boolean) => {
    updateTaskMutation.mutate({ id, completed });
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      createTaskMutation.mutate(newTaskTitle);
    }
  };

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
        <CardTitle className="font-semibold text-neutral-900 dark:text-white flex items-center">
          <CheckSquare className="h-5 w-5 mr-2 text-primary-500" />
          Today's Tasks
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View All Tasks</DropdownMenuItem>
            <DropdownMenuItem>Filter Tasks</DropdownMenuItem>
            <DropdownMenuItem>Sort Tasks</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <div className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
          {completedTasks.length} of {tasks.length} tasks completed
        </div>
        <Progress value={completionPercentage} className="h-2 bg-neutral-200 dark:bg-neutral-700 mb-4" />

        <ul className="mt-4 space-y-3">
          {tasks.map(task => (
            <li key={task.id} className="flex items-start">
              <Checkbox 
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={(checked) => handleTaskToggle(task.id, checked === true)}
                className="mt-1"
              />
              <label 
                htmlFor={`task-${task.id}`}
                className={cn(
                  "ml-3 text-sm cursor-pointer", 
                  task.completed 
                    ? "line-through text-neutral-500 dark:text-neutral-400" 
                    : "text-neutral-800 dark:text-neutral-200"
                )}
              >
                {task.title}
              </label>
            </li>
          ))}
        </ul>

        <Button 
          variant="link" 
          className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 p-0"
          onClick={() => setIsAddTaskDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add New Task
        </Button>
      </CardContent>

      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input 
                id="task-title" 
                value={newTaskTitle} 
                onChange={(e) => setNewTaskTitle(e.target.value)} 
                placeholder="Enter task title"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
