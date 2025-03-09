import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { WidgetData } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface DndContextProps {
  items: WidgetData[];
  setItems: (items: WidgetData[]) => void;
  draggingId: number | null;
  setDraggingId: (id: number | null) => void;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, id: number) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, targetId: number) => void;
  handleDragEnd: () => void;
}

const DndContext = createContext<DndContextProps | undefined>(undefined);

export function DndProvider({ children, initialItems = [] }: { children: ReactNode, initialItems?: WidgetData[] }) {
  const [items, setItems] = useState<WidgetData[]>(initialItems);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, id: number) => {
    e.dataTransfer.setData('text/plain', id.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>, targetId: number) => {
      e.preventDefault();
      const draggedId = Number(e.dataTransfer.getData('text/plain'));
      
      if (draggedId === targetId || !items.length) return;

      const draggedIndex = items.findIndex(item => item.id === draggedId);
      const targetIndex = items.findIndex(item => item.id === targetId);
      
      if (draggedIndex === -1 || targetIndex === -1) return;

      const newItems = [...items];
      const [removed] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, removed);
      
      // Update positions
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        position: index
      }));

      setItems(updatedItems);
      setDraggingId(null);

      // Update widget order in backend
      try {
        await apiRequest('POST', '/api/widgets/reorder', {
          widgetIds: updatedItems.map(item => item.id)
        });
        
        // Invalidate widgets query to refetch with new order
        queryClient.invalidateQueries({ queryKey: ['/api/widgets'] });
      } catch (error) {
        console.error('Failed to update widget order:', error);
      }
    },
    [items]
  );

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
  }, []);

  const value = {
    items,
    setItems,
    draggingId,
    setDraggingId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  };

  return <DndContext.Provider value={value}>{children}</DndContext.Provider>;
}

export function useDnd() {
  const context = useContext(DndContext);
  if (context === undefined) {
    throw new Error('useDnd must be used within a DndProvider');
  }
  return context;
}
