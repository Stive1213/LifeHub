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
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MoreHorizontal, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Event } from '@/lib/types';
import { format, addMonths, subMonths, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, isSameDay, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

export default function CalendarWidget() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEvent, setNewEvent] = useState({ title: '', time: '' });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const createEventMutation = useMutation({
    mutationFn: async ({ title, startDate }: { title: string, startDate: Date }) => {
      return await apiRequest('POST', '/api/events', { title, startDate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setNewEvent({ title: '', time: '' });
      setIsAddEventDialogOpen(false);
    }
  });

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-neutral-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    
    return (
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-neutral-500 dark:text-neutral-400">
        {days.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = 'd';
    const rows = [];

    let days = eachDayOfInterval({
      start: startDate,
      end: endDate
    });

    let formattedDays = [];
    for (let day of days) {
      const eventsForDay = events.filter(event => {
        const eventDate = new Date(event.startDate);
        return isSameDay(day, eventDate);
      });
      
      formattedDays.push(
        <div 
          key={day.toString()} 
          className={cn(
            "h-8 flex justify-center items-center text-xs cursor-pointer",
            !isSameMonth(day, monthStart) && "text-neutral-400 dark:text-neutral-600",
            isSameDay(day, new Date()) && "font-semibold bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full",
            eventsForDay.length > 0 && !isToday(day) && "relative"
          )}
          onClick={() => {
            setSelectedDate(day);
            setIsAddEventDialogOpen(true);
          }}
        >
          {format(day, dateFormat)}
          {eventsForDay.length > 0 && (
            <div className="absolute bottom-0 w-full h-1 bg-primary-500"></div>
          )}
        </div>
      );
    }

    // Split the days into rows
    const totalDays = formattedDays.length;
    let daysInMonth = [];
    
    for (let i = 0; i < totalDays; i += 7) {
      daysInMonth.push(
        <div key={i} className="grid grid-cols-7 gap-1">
          {formattedDays.slice(i, i + 7)}
        </div>
      );
    }

    return <div className="mt-1">{daysInMonth}</div>;
  };

  const renderEvents = () => {
    const today = new Date();
    const todayEvents = events
      .filter(event => {
        const eventDate = new Date(event.startDate);
        return isSameDay(eventDate, today);
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    if (todayEvents.length === 0) {
      return (
        <div className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          No events scheduled for today
        </div>
      );
    }

    return (
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-neutral-800 dark:text-neutral-200">
            Today - {format(today, 'MMM d')}
          </span>
        </div>
        {todayEvents.map(event => (
          <div 
            key={event.id} 
            className="px-3 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-md border-l-4 border-primary-500"
          >
            <div className="text-sm text-neutral-900 dark:text-neutral-100 font-medium">
              {event.title}
            </div>
            {event.startDate && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {format(new Date(event.startDate), 'h:mm a')}
                {event.endDate && ` - ${format(new Date(event.endDate), 'h:mm a')}`}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const handleAddEvent = () => {
    if (selectedDate && newEvent.title.trim()) {
      // Create a date object from the selected date and time
      let startDate = new Date(selectedDate);
      
      if (newEvent.time) {
        const [hours, minutes] = newEvent.time.split(':').map(Number);
        startDate.setHours(hours, minutes);
      }
      
      createEventMutation.mutate({
        title: newEvent.title,
        startDate
      });
    }
  };

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
        <CardTitle className="font-semibold text-neutral-900 dark:text-white flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-primary-500" />
          Calendar
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Full Calendar</DropdownMenuItem>
            <DropdownMenuItem>Add New Event</DropdownMenuItem>
            <DropdownMenuItem>Import Events</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-6 py-4">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
        {renderEvents()}
      </CardContent>

      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Event for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="event-title">Event Title</Label>
              <Input 
                id="event-title" 
                value={newEvent.title} 
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} 
                placeholder="Enter event title"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-time">Time (optional)</Label>
              <Input 
                id="event-time" 
                type="time"
                value={newEvent.time} 
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEvent} disabled={!newEvent.title.trim()}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
