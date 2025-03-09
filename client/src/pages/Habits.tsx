import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Checkbox,
  Progress,
  Textarea
} from '@/components/ui';
import { 
  Plus, 
  TrendingUp, 
  Trophy, 
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Habit, HabitCompletion } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Habits() {
  const [isAddHabitDialogOpen, setIsAddHabitDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: [] as string[]
  });

  const { data: habits = [] } = useQuery<Habit[]>({
    queryKey: ['/api/habits'],
  });

  const createHabitMutation = useMutation({
    mutationFn: async ({ name, description, frequency }: { 
      name: string; 
      description?: string; 
      frequency: string[];
    }) => {
      return await apiRequest('POST', '/api/habits', {
        name,
        description,
        frequency,
        streak: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      setNewHabit({ name: '', description: '', frequency: [] });
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

  const deleteHabitMutation = useMutation({
    mutationFn: async (habitId: number) => {
      return await apiRequest('DELETE', `/api/habits/${habitId}`, {});
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
        description: newHabit.description || undefined,
        frequency: newHabit.frequency
      });
    }
  };

  const handleCompleteHabit = (habitId: number) => {
    completeHabitMutation.mutate(habitId);
  };

  // Prepare data for streaks display
  const topStreaks = [...habits]
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3);

  // Get current week days
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Helper function to check if a habit is completed for a specific day
  const isCompletedForDay = (habit: Habit, date: Date) => {
    if (!habit.completions) return false;
    
    return habit.completions.some(completion => {
      const completionDate = new Date(completion.date);
      return isSameDay(completionDate, date);
    });
  };

  // Check if a day is in the habit's frequency
  const isDayInFrequency = (habit: Habit, dayIndex: number) => {
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return habit.frequency?.includes(dayNames[dayIndex]) || false;
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Habits</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Track and build positive habits
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => setIsAddHabitDialogOpen(true)}
            className="inline-flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Habit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Your Habits</CardTitle>
            <CardDescription>Track your daily habits and build streaks</CardDescription>
          </CardHeader>
          <CardContent>
            {habits.length > 0 ? (
              <div className="space-y-6">
                {habits.map(habit => (
                  <div 
                    key={habit.id} 
                    className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{habit.name}</h3>
                        {habit.description && (
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            {habit.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setSelectedHabit(habit)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteHabitMutation.mutate(habit.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <Trophy className="h-5 w-5 text-amber-500 mr-1" />
                      <span className="text-sm font-medium">
                        Current streak: {habit.streak} day{habit.streak !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2 mb-3">
                      {weekDays.map((day, idx) => {
                        const isCompleted = isCompletedForDay(habit, day);
                        const isInFrequency = isDayInFrequency(habit, idx);
                        const isToday = isSameDay(day, new Date());
                        
                        return (
                          <div 
                            key={day.toString()} 
                            className="flex flex-col items-center"
                          >
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              {format(day, 'EEE')}
                            </span>
                            <div 
                              className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center text-xs",
                                isCompleted 
                                  ? "bg-green-500 text-white"
                                  : isInFrequency 
                                    ? isToday 
                                      ? "border-2 border-primary-500 cursor-pointer" 
                                      : "border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400"
                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600"
                              )}
                              onClick={() => {
                                if (isInFrequency && isToday && !isCompleted) {
                                  handleCompleteHabit(habit.id);
                                }
                              }}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : isInFrequency ? (
                                format(day, 'd')
                              ) : (
                                <XCircle className="h-4 w-4 opacity-50" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      Scheduled for: {habit.frequency?.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">
                You haven't created any habits yet. Click "Add Habit" to get started!
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                Top Streaks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topStreaks.length > 0 ? (
                <div className="space-y-4">
                  {topStreaks.map(habit => (
                    <div key={habit.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{habit.name}</span>
                        <span className="text-amber-500 font-semibold">{habit.streak} day{habit.streak !== 1 ? 's' : ''}</span>
                      </div>
                      <Progress 
                        value={Math.min(habit.streak * 10, 100)} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-neutral-500 dark:text-neutral-400">
                  Start building your streaks!
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weekDays.map((day, index) => {
                  const isToday = isSameDay(day, new Date());
                  const habitsDueToday = habits.filter(habit => 
                    isDayInFrequency(habit, index)
                  );
                  const completedToday = habitsDueToday.filter(habit => 
                    isCompletedForDay(habit, day)
                  );
                  
                  return (
                    <div 
                      key={day.toString()} 
                      className={cn(
                        "p-2 rounded-md",
                        isToday && "bg-primary-50 dark:bg-primary-900/20 border-l-2 border-primary-500"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "font-medium",
                          isToday && "text-primary-700 dark:text-primary-400"
                        )}>
                          {format(day, 'EEEE')}
                        </span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {format(day, 'MMM d')}
                        </span>
                      </div>
                      {habitsDueToday.length > 0 ? (
                        <div className="text-sm mt-1">
                          <span className="text-neutral-600 dark:text-neutral-400">
                            {completedToday.length}/{habitsDueToday.length} habits completed
                          </span>
                        </div>
                      ) : (
                        <div className="text-sm mt-1 text-neutral-500 dark:text-neutral-500">
                          No habits scheduled
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isAddHabitDialogOpen} onOpenChange={setIsAddHabitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Habit</DialogTitle>
            <DialogDescription>
              Create a new habit to track regularly
            </DialogDescription>
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
              <Label htmlFor="habit-description">Description (Optional)</Label>
              <Textarea 
                id="habit-description" 
                value={newHabit.description} 
                onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })} 
                placeholder="Describe your habit..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Frequency (select days)</Label>
              <div className="grid grid-cols-4 gap-2">
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
              disabled={!newHabit.name.trim() || newHabit.frequency.length === 0 || createHabitMutation.isPending}
            >
              {createHabitMutation.isPending ? 'Creating...' : 'Add Habit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedHabit} onOpenChange={(open) => !open && setSelectedHabit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Habit Details</DialogTitle>
          </DialogHeader>
          {selectedHabit && (
            <div className="space-y-4 py-2">
              <div>
                <h3 className="font-semibold text-lg">{selectedHabit.name}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {selectedHabit.description || 'No description provided'}
                </p>
              </div>
              
              <div className="flex items-center">
                <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                <span className="font-medium">
                  Current streak: {selectedHabit.streak} day{selectedHabit.streak !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Schedule</h4>
                <div className="flex flex-wrap gap-1">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, index) => (
                    <div 
                      key={day}
                      className={cn(
                        "px-2 py-1 rounded text-xs",
                        selectedHabit.frequency?.includes(day)
                          ? "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                      )}
                    >
                      {DAYS_OF_WEEK[index]}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Recent Completions</h4>
                {selectedHabit.completions && selectedHabit.completions.length > 0 ? (
                  <div className="space-y-2">
                    {selectedHabit.completions
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map(completion => (
                        <div key={completion.id} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">
                            {format(new Date(completion.date), 'MMMM d, yyyy')}
                          </span>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    No completions recorded yet
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedHabit(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
