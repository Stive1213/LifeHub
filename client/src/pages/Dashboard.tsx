import { useState } from 'react';
import { 
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui';
import { Plus, PencilLine } from 'lucide-react';
import TaskWidget from '@/components/widgets/TaskWidget';
import CalendarWidget from '@/components/widgets/CalendarWidget';
import BudgetWidget from '@/components/widgets/BudgetWidget';
import HabitWidget from '@/components/widgets/HabitWidget';
import JournalWidget from '@/components/widgets/JournalWidget';
import QuickToolsWidget from '@/components/widgets/QuickToolsWidget';
import { WidgetType, WidgetData } from '@/lib/types';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { DndProvider, useDnd } from '@/lib/dndContext';

const widgetComponents: Record<WidgetType, React.FC> = {
  tasks: TaskWidget,
  calendar: CalendarWidget,
  budget: BudgetWidget,
  habits: HabitWidget,
  journal: JournalWidget,
  quickTools: QuickToolsWidget,
  contacts: () => <div>Contacts Widget</div>,
  documents: () => <div>Documents Widget</div>,
  community: () => <div>Community Widget</div>
};

const widgetNames: Record<WidgetType, string> = {
  tasks: 'Tasks & Goals',
  calendar: 'Calendar',
  budget: 'Budget',
  habits: 'Habits',
  journal: 'Journal',
  quickTools: 'Quick Tools',
  contacts: 'Contacts',
  documents: 'Documents',
  community: 'Community'
};

function DashboardGrid() {
  const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType>('tasks');
  const { items, handleDragStart, handleDragOver, handleDrop, handleDragEnd, draggingId } = useDnd();

  const createWidgetMutation = useMutation({
    mutationFn: async (widgetType: WidgetType) => {
      return await apiRequest('POST', '/api/widgets', {
        type: widgetType,
        position: items.length,
        config: {}
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/widgets'] });
      setIsAddWidgetDialogOpen(false);
    }
  });

  const handleAddWidget = () => {
    createWidgetMutation.mutate(selectedWidgetType);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <Button 
            variant="default" 
            className="inline-flex items-center"
            onClick={() => setIsAddWidgetDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Widget
          </Button>
          <Button 
            variant="outline" 
            className="inline-flex items-center"
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Customize
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((widget) => {
          const WidgetComponent = widgetComponents[widget.type];
          return (
            <div
              key={widget.id}
              draggable
              onDragStart={(e) => handleDragStart(e, widget.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, widget.id)}
              onDragEnd={handleDragEnd}
              className={`${draggingId === widget.id ? 'opacity-50' : 'opacity-100'} cursor-move`}
            >
              <WidgetComponent />
            </div>
          );
        })}
      </div>

      <Dialog open={isAddWidgetDialogOpen} onOpenChange={setIsAddWidgetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Widget</DialogTitle>
            <DialogDescription>
              Select a widget to add to your dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={selectedWidgetType}
              onValueChange={(value) => setSelectedWidgetType(value as WidgetType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a widget" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(widgetNames).map(([type, name]) => (
                  <SelectItem key={type} value={type}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddWidgetDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddWidget}>
              Add Widget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Dashboard() {
  const { data: widgets = [] } = useQuery<WidgetData[]>({
    queryKey: ['/api/widgets'],
  });

  return (
    <DndProvider initialItems={widgets}>
      <DashboardGrid />
    </DndProvider>
  );
}
