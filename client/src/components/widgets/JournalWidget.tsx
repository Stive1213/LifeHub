import { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, BookOpen, Image, Smile, Frown, Heart } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { JournalEntry } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

export default function JournalWidget() {
  const [journalContent, setJournalContent] = useState('');
  const [mood, setMood] = useState<string | null>(null);

  const { data: entries = [] } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal'],
  });

  // Get today's entry if it exists
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayEntry = entries.find(entry => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === today.getTime();
  });

  // Initialize state with today's entry if it exists
  useState(() => {
    if (todayEntry) {
      setJournalContent(todayEntry.content);
      setMood(todayEntry.mood || null);
    }
  });

  const createEntryMutation = useMutation({
    mutationFn: async ({ content, mood }: { content: string, mood?: string }) => {
      return await apiRequest('POST', '/api/journal', {
        content,
        mood,
        date: new Date()
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

  const handleSaveEntry = () => {
    if (!journalContent.trim()) return;

    if (todayEntry) {
      updateEntryMutation.mutate({
        id: todayEntry.id,
        content: journalContent,
        mood: mood || undefined
      });
    } else {
      createEntryMutation.mutate({
        content: journalContent,
        mood: mood || undefined
      });
    }
  };

  const handleMoodSelect = (selectedMood: string) => {
    setMood(mood === selectedMood ? null : selectedMood);
  };

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
        <CardTitle className="font-semibold text-neutral-900 dark:text-white flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-primary-500" />
          Journal
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Journal History</DropdownMenuItem>
            <DropdownMenuItem>Export Entries</DropdownMenuItem>
            <DropdownMenuItem>Journal Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Today's Entry</h3>
          <div className="flex space-x-2">
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
        </div>

        <Textarea
          className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md text-sm text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          rows={5}
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
            disabled={!journalContent.trim() || createEntryMutation.isPending || updateEntryMutation.isPending}
          >
            Save Entry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
