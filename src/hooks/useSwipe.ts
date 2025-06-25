
import { useState, useRef, useCallback } from 'react';

interface SwipeOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
}

type SwipeDirection = 'left' | 'right' | 'none';

export const useSwipe = ({ onSwipeLeft, onSwipeRight, threshold = 100 }: SwipeOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);
  const [startPosition, setStartPosition] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  const isNoSwipeZone = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof Element)) return false;
    
    // Check if the target or any parent has the no-swipe attribute
    return target.closest('[data-no-swipe="true"]') !== null;
  };

  const handleStart = useCallback((clientX: number, event: MouseEvent | TouchEvent) => {
    // Don't start swipe if clicking/touching in a no-swipe zone
    if (isNoSwipeZone(event.target)) {
      return;
    }
    
    setIsDragging(true);
    setStartPosition(clientX);
    setDragPosition(0);
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    
    const deltaX = clientX - startPosition;
    setDragPosition(deltaX);
  }, [isDragging, startPosition]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (Math.abs(dragPosition) > threshold) {
      if (dragPosition > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    }
    
    setDragPosition(0);
  }, [isDragging, dragPosition, threshold, onSwipeLeft, onSwipeRight]);

  const handlers = {
    onMouseDown: (e: React.MouseEvent) => handleStart(e.clientX, e.nativeEvent),
    onMouseMove: (e: React.MouseEvent) => handleMove(e.clientX),
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,
    onTouchStart: (e: React.TouchEvent) => handleStart(e.touches[0].clientX, e.nativeEvent),
    onTouchMove: (e: React.TouchEvent) => handleMove(e.touches[0].clientX),
    onTouchEnd: handleEnd,
  };

  const getSwipeDirection = (): SwipeDirection => {
    if (Math.abs(dragPosition) < 20) return 'none';
    return dragPosition > 0 ? 'right' : 'left';
  };

  const getSwipeIntensity = () => {
    return Math.min(Math.abs(dragPosition) / threshold, 1);
  };

  return {
    elementRef,
    handlers,
    isDragging,
    dragPosition,
    swipeDirection: getSwipeDirection(),
    swipeIntensity: getSwipeIntensity(),
  };
};
