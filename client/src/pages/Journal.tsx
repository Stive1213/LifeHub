import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui';
import { 
  BookOpen, 
  Calendar as CalendarIcon, 
  Image, 
  Smile, 
  Frown, 
  Heart,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Edit
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { JournalEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, subDays, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export default function Journal() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [journalContent, setJournalContent] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [isViewEntryDialogOpen, setIsViewEntryDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [monthView, setMonthView] = useState(new Date());
  
  const { data: entries = [] } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal'],
  });

  // Get current day's entry if it exists
  const currentEntry = entries.find(entry => {
    const entryDate = new Date(entry.date);
    return isSameDay(entryDate, selectedDate);
  });

  // Update state when selected date or current entry changes
  useEffect(() => {
    if (currentEntry) {
      setJournalContent(currentEntry.content);
      setMood(currentEntry.mood || null);
    } else {
      setJournalContent('');
      setMood(null);
    }
  }, [currentEntry, selectedDate]);

  const createEntryMutation = useMutation({
    mutationFn: async ({ content, mood, date }: { content: string, mood?: string, date: Date }) => {
      return await apiRequest('POST', '/api/journal', {
        content,
        mood,
        date
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
    }
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, content, mood }: { id: number, content: string, mood?: string }) => {
      return await apiRequest('PATCH', `/api/journal/${id}`, {
        content,
        mood
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
    }
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/journal/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      setSelectedEntry(null);
      setIsViewEntryDialogOpen(false);
    }
  });

  const handleSaveEntry = () => {
    if (!journalContent.trim()) return;

    if (currentEntry) {
      updateEntryMutation.mutate({
        id: currentEntry.id,
        content: journalContent,
        mood: mood || undefined
      });
    } else {
      createEntryMutation.mutate({
        content: journalContent,
        mood: mood || undefined,
        date: selectedDate
      });
    }
  };

  const handleMoodSelect = (selectedMood: string) => {
    setMood(mood === selectedMood ? null : selectedMood);
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsViewEntryDialogOpen(true);
  };

  const handlePrevDay = () => {
    setSelectedDate(prevDate => subDays(prevDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, 1));
  };

  const handlePrevMonth = () => {
    setMonthView(prev => subDays(prev, 30));
  };

  const handleNextMonth = () => {
    setMonthView(prev => addDays(prev, 30));
  };

  // Get days with entries for the calendar view
  const daysWithEntries = entries.map(entry => new Date(entry.date));

  // Get days for the month view
  const monthStart = startOfMonth(monthView);
  const monthEnd = endOfMonth(monthView);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get recent entries
  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Get mood statistics
  const moodStats = entries.reduce((acc, entry) => {
    if (entry.mood) {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const totalEntries = entries.length;
  const moodPercentages = Object.entries(moodStats).map(([mood, count]) => ({
    mood,
    percentage: Math.round((count / totalEntries) * 100)
  }));

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Journal</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Capture your thoughts and track your mood
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePrevDay}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium text-neutral-900 dark:text-white">
              {format(selectedDate, 'MMMM d, yyyy')}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNextDay}
              disabled={isSameDay(selectedDate, new Date()) || selectedDate > new Date()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Select 
            value={format(selectedDate, 'yyyy-MM-dd')}
            onValueChange={(value) => setSelectedDate(new Date(value))}
          >
            <SelectTrigger className="w-[180px]">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {entries.map(entry => (
                <SelectItem 
                  key={entry.id} 
                  value={format(new Date(entry.date), 'yyyy-MM-dd')}
                >
                  {format(new Date(entry.date), 'MMM d, yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
              <CardTitle className="font-semibold text-neutral-900 dark:text-white flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-primary-500" />
                {currentEntry ? 'Edit Entry' : 'New Entry'}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "p-1 rounded-full", 
                    mood === "happy" 
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-500" 
                      : "text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  )}
                  onClick={() => handleMoodSelect("happy")}
                >
                  <Smile className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "p-1 rounded-full", 
                    mood === "sad" 
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-500" 
                      : "text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  )}
                  onClick={() => handleMoodSelect("sad")}
                >
                  <Frown className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "p-1 rounded-full", 
                    mood === "love" 
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-500" 
                      : "text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  )}
                  onClick={() => handleMoodSelect("love")}
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-4">
              <Textarea
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md text-sm text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={10}
                placeholder="Write your thoughts for today..."
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
              />
              <div className="mt-4 flex justify-between">
                <Button 
                  variant="ghost" 
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center"
                >
                  <Image className="h-4 w-4 mr-1" />
                  Add Photo
                </Button>
                <Button 
                  variant="default"
                  onClick={handleSaveEntry}
                  disabled={!journalContent.trim() || 
                    createEntryMutation.isPending || 
                    updateEntryMutation.isPending}
                >
                  {createEntryMutation.isPending || updateEntryMutation.isPending 
                    ? 'Saving...' 
                    : currentEntry ? 'Update Entry' : 'Save Entry'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {recentEntries.length > 0 ? (
                <div className="space-y-4">
                  {recentEntries.map(entry => (
                    <div 
                      key={entry.id} 
                      className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                      onClick={() => handleViewEntry(entry)}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium">
                          {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
                        </div>
                        {entry.mood && (
                          <div className="text-lg">
                            {entry.mood === 'happy' && <Smile className="h-5 w-5 text-green-500" />}
                            {entry.mood === 'sad' && <Frown className="h-5 w-5 text-blue-500" />}
                            {entry.mood === 'love' && <Heart className="h-5 w-5 text-red-500" />}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                        {entry.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  No journal entries yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                <div className="font-medium">
                  {format(monthView, 'MMMM yyyy')}
                </div>
                <Button variant="ghost" size="sm" onClick={handleNextMonth}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs text-neutral-500 dark:text-neutral-400">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 mt-1">
                {/* Fill in empty slots before the first day of the month */}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-start-${i}`} className="h-8"></div>
                ))}

                {/* Render days of the month */}
                {daysInMonth.map(day => {
                  const hasEntry = daysWithEntries.some(entryDate => isSameDay(entryDate, day));
                  const isSelected = isSameDay(day, selectedDate);
                  const isPast = day < new Date() && !isSameDay(day, new Date());
                  
                  return (
                    <div
                      key={day.getTime()}
                      className={cn(
                        "h-8 flex justify-center items-center text-xs rounded-full cursor-pointer",
                        hasEntry && "font-bold",
                        isSelected && "bg-primary-500 text-white",
                        !isSelected && hasEntry && "text-primary-600 dark:text-primary-400",
                        !isSelected && !hasEntry && "text-neutral-800 dark:text-neutral-200",
                        !isSelected && isPast && "text-neutral-400 dark:text-neutral-600"
                      )}
                      onClick={() => setSelectedDate(day)}
                    >
                      {format(day, 'd')}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {totalEntries > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Mood Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moodPercentages.map(({ mood, percentage }) => (
                    <div key={mood} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {mood === 'happy' && <Smile className="h-5 w-5 text-green-500 mr-2" />}
                          {mood === 'sad' && <Frown className="h-5 w-5 text-blue-500 mr-2" />}
                          {mood === 'love' && <Heart className="h-5 w-5 text-red-500 mr-2" />}
                          <span className="capitalize">{mood}</span>
                        </div>
                        <span>{percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            mood === 'happy' && "bg-green-500",
                            mood === 'sad' && "bg-blue-500",
                            mood === 'love' && "bg-red-500"
                          )}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isViewEntryDialogOpen} onOpenChange={setIsViewEntryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>
                {selectedEntry && format(new Date(selectedEntry.date), 'MMMM d, yyyy')}
              </span>
              {selectedEntry?.mood && (
                <span>
                  {selectedEntry.mood === 'happy' && <Smile className="h-5 w-5 text-green-500" />}
                  {selectedEntry.mood === 'sad' && <Frown className="h-5 w-5 text-blue-500" />}
                  {selectedEntry.mood === 'love' && <Heart className="h-5 w-5 text-red-500" />}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="py-2">
              <p className="whitespace-pre-wrap leading-relaxed">
                {selectedEntry.content}
              </p>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              className="text-red-500 hover:text-red-600"
              onClick={() => selectedEntry && deleteEntryMutation.mutate(selectedEntry.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <div className="space-x-2">
              <Button 
                variant="outline"
                onClick={() => {
                  if (selectedEntry) {
                    setSelectedDate(new Date(selectedEntry.date));
                    setIsViewEntryDialogOpen(false);
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button onClick={() => setIsViewEntryDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
