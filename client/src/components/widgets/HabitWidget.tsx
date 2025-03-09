import { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, TrendingUp, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Habit } from '@/lib/types';

const DAYS_OF_WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HabitWidget() {
  const [isAddHabitDialogOpen, setIsAddHabitDialogOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    frequency: [] as string[]
  });

  const { data: habits = [] } = useQuery<Habit[]>({
    queryKey: ['/api/habits'],
  });

  const createHabitMutation = useMutation({
    mutationFn: async ({ name, frequency }: { name: string, frequency: string[] }) => {
      return await apiRequest('POST', '/api/habits', {
        name,
        frequency,
        streak: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      setNewHabit({ name: '', frequency: [] });
      setIsAddHabitDialogOpen(false);
    }
  });

  const completeHabitMutation = useMutation({
    mutationFn: async (habitId: number) => {
      return await apiRequest('POST', `/api/habits/${habitId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
    }
  });

  const toggleDaySelection = (day: string) => {
    setNewHabit(prev => {
      const frequency = [...prev.frequency];
      const index = frequency.indexOf(day);
      
      if (index === -1) {
        frequency.push(day);
      } else {
        frequency.splice(index, 1);
      }
      
      return { ...prev, frequency };
    });
  };

  const handleAddHabit = () => {
    if (newHabit.name.trim() && newHabit.frequency.length > 0) {
      createHabitMutation.mutate({
        name: newHabit.name,
        frequency: newHabit.frequency
      });
    }
  };

  const handleCompleteHabit = (habitId: number) => {
    completeHabitMutation.mutate(habitId);
  };

  // Helper function to simulate habit completion status for demo
  const isHabitCompletedForDay = (habit: Habit, dayIndex: number): boolean => {
    // For demonstration, we'll show completion based on streak and frequency
    const frequency = habit.frequency || [];
    
    // Convert dayIndex (0-6, Monday to Sunday) to day name for check
    const dayName = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][dayIndex];
    
    // Check if the day is in the habit's frequency
    const isDayInFrequency = frequency.includes(dayName);
    
    // For simplicity, if streak is 0, nothing is completed
    if (habit.streak === 0) return false;
    
    // If the day is not in frequency, it's not applicable (we'll show neutral)
    if (!isDayInFrequency) return false;
    
    // If streak is at least dayIndex + 1, show as completed
    // This simulates completing habits in order M,T,W,etc.
    return habit.streak > dayIndex;
  };

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
        <CardTitle className="font-semibold text-neutral-900 dark:text-white flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-primary-500" />
          Habits
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View All Habits</DropdownMenuItem>
            <DropdownMenuItem>Show Statistics</DropdownMenuItem>
            <DropdownMenuItem>Configure Reminders</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <ul className="space-y-4">
          {habits.map(habit => (
            <li key={habit.id}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  {habit.name}
                </span>
                <span className="text-xs font-medium text-primary-500">
                  {habit.streak > 0 ? `${habit.streak} day streak` : 'Start your streak!'}
                </span>
              </div>
              <div className="flex space-x-1 mb-1">
                {DAYS_OF_WEEK.map((day, index) => {
                  const isCompleted = isHabitCompletedForDay(habit, index);
                  const frequency = habit.frequency || [];
                  const dayName = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][index];
                  const isDayInFrequency = frequency.includes(dayName);
                  
                  return (
                    <Button
                      key={day}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-8 h-8 p-0 rounded-full text-xs",
                        isCompleted
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : isDayInFrequency
                            ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                            : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 opacity-50"
                      )}
                      onClick={() => {
                        if (isDayInFrequency && !isCompleted) {
                          handleCompleteHabit(habit.id);
                        }
                      }}
                      disabled={!isDayInFrequency || isCompleted}
                    >
                      {day}
                    </Button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
        
        <Button 
          variant="link" 
          className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 p-0"
          onClick={() => setIsAddHabitDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add New Habit
        </Button>
      </CardContent>

      <Dialog open={isAddHabitDialogOpen} onOpenChange={setIsAddHabitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Habit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="habit-name">Habit Name</Label>
              <Input 
                id="habit-name" 
                value={newHabit.name} 
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })} 
                placeholder="e.g., Morning Exercise"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Frequency (select days)</Label>
              <div className="flex flex-wrap gap-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, index) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`day-${day}`} 
                      checked={newHabit.frequency.includes(day)}
                      onCheckedChange={() => toggleDaySelection(day)}
                    />
                    <Label htmlFor={`day-${day}`} className="text-sm">
                      {DAYS_OF_WEEK[index]}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddHabitDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddHabit} 
              disabled={!newHabit.name.trim() || newHabit.frequency.length === 0}
            >
              Add Habit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
