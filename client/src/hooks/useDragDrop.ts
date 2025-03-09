import { useState, useCallback, useEffect } from 'react';
import { WidgetData } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

export function useDragDrop(widgets: WidgetData[] | undefined) {
  const [items, setItems] = useState<WidgetData[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  // Initialize items from widgets
  useEffect(() => {
    if (widgets?.length) {
      setItems(widgets);
    }
  }, [widgets]);

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

  return {
    items,
    draggingId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  };
}

export default useDragDrop;
