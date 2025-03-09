import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea
} from '@/components/ui';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  CalendarIcon, 
  Clock, 
  MapPin 
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Event } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  isBefore, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns';

interface CalendarDayProps {
  day: Date;
  events: Event[];
  onSelectDate: (date: Date) => void;
}

function CalendarDay({ day, events, onSelectDate }: CalendarDayProps) {
  const eventsForDay = events.filter(event => {
    const eventDate = new Date(event.startDate);
    return isSameDay(day, eventDate);
  });

  const isCurrentMonth = isSameMonth(day, new Date());
  const isPast = isBefore(day, new Date()) && !isToday(day);

  return (
    <div 
      className={cn(
        "min-h-[100px] p-2 border border-neutral-200 dark:border-neutral-700",
        !isCurrentMonth && "bg-neutral-50 dark:bg-neutral-800/50",
        isPast && "bg-neutral-50/70 dark:bg-neutral-800/30",
        isToday(day) && "border-primary-500 dark:border-primary-400 border-2"
      )}
      onClick={() => onSelectDate(day)}
    >
      <div className={cn(
        "font-medium text-sm mb-1",
        !isCurrentMonth && "text-neutral-400 dark:text-neutral-500",
        isToday(day) && "text-primary-500 dark:text-primary-400"
      )}>
        {format(day, 'd')}
      </div>
      <div className="space-y-1">
        {eventsForDay.slice(0, 3).map(event => (
          <div 
            key={event.id} 
            className="text-xs p-1 rounded truncate"
            style={{ 
              backgroundColor: event.color ? `${event.color}20` : 'rgba(79, 70, 229, 0.12)',
              color: event.color || 'rgb(79, 70, 229)'
            }}
            title={event.title}
          >
            {event.title}
          </div>
        ))}
        {eventsForDay.length > 3 && (
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            + {eventsForDay.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    color: '#4F46E5' // Default primary color
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: {
      title: string;
      description?: string;
      startDate: Date;
      endDate?: Date;
      location?: string;
      color?: string;
    }) => {
      return await apiRequest('POST', '/api/events', eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setNewEvent({
        title: '',
        description: '',
        startTime: '09:00',
        endTime: '10:00',
        location: '',
        color: '#4F46E5'
      });
      setIsAddEventDialogOpen(false);
    }
  });

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setIsAddEventDialogOpen(true);
  };

  const handleAddEvent = () => {
    if (selectedDate && newEvent.title.trim()) {
      // Create start date with time
      const [startHours, startMinutes] = newEvent.startTime.split(':').map(Number);
      const startDate = new Date(selectedDate);
      startDate.setHours(startHours, startMinutes, 0);
      
      // Create end date with time
      const [endHours, endMinutes] = newEvent.endTime.split(':').map(Number);
      const endDate = new Date(selectedDate);
      endDate.setHours(endHours, endMinutes, 0);
      
      createEventMutation.mutate({
        title: newEvent.title,
        description: newEvent.description || undefined,
        startDate,
        endDate,
        location: newEvent.location || undefined,
        color: newEvent.color
      });
    }
  };

  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-px">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-semibold text-sm bg-neutral-100 dark:bg-neutral-800">
            {day}
          </div>
        ))}
        {days.map(day => (
          <CalendarDay 
            key={day.toString()} 
            day={day} 
            events={events} 
            onSelectDate={handleSelectDate}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Calendar</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Manage your events and schedule
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <Button 
            onClick={() => setIsAddEventDialogOpen(true)}
            className="inline-flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="mx-4 font-bold text-lg">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2 mt-3 md:mt-0">
            <Select defaultValue="month" value={view} onValueChange={(value) => setView(value as 'month' | 'week' | 'day')}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
              Today
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'month' && renderCalendarGrid()}
          {view === 'week' && (
            <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
              Week view coming soon
            </div>
          )}
          {view === 'day' && (
            <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
              Day view coming soon
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events
              .filter(event => new Date(event.startDate) >= new Date())
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .slice(0, 5)
              .map(event => (
                <div 
                  key={event.id} 
                  className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-md"
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium">{event.title}</h3>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: event.color || 'rgb(79, 70, 229)' }}
                    ></div>
                  </div>
                  {event.description && (
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {event.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {format(new Date(event.startDate), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {format(new Date(event.startDate), 'h:mm a')}
                      {event.endDate && ` - ${format(new Date(event.endDate), 'h:mm a')}`}
                    </div>
                    {event.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            {events.filter(event => new Date(event.startDate) >= new Date()).length === 0 && (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                No upcoming events. Click 'Add Event' to create one.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Event for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'New Date'}
            </DialogTitle>
            <DialogDescription>
              Create a new event in your calendar.
            </DialogDescription>
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
              <Label htmlFor="event-description">Description (Optional)</Label>
              <Textarea
                id="event-description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Enter event description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-start-time">Start Time</Label>
                <Input
                  id="event-start-time"
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-end-time">End Time</Label>
                <Input
                  id="event-end-time"
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-location">Location (Optional)</Label>
              <Input
                id="event-location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Enter event location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-color">Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="event-color"
                  type="color"
                  value={newEvent.color}
                  onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                  className="w-12 h-8 p-1"
                />
                <span className="text-sm text-neutral-500">
                  Choose a color for your event
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddEvent}
              disabled={!newEvent.title.trim() || createEventMutation.isPending}
            >
              {createEventMutation.isPending ? 'Creating...' : 'Add Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
