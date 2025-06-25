
import { useState, useRef, useCallback } from 'react';

interface SwipeOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
}

export const useSwipe = ({ onSwipeLeft, onSwipeRight, threshold = 100 }: SwipeOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);
  const [startPosition, setStartPosition] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleStart = useCallback((clientX: number) => {
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
    onMouseDown: (e: React.MouseEvent) => handleStart(e.clientX),
    onMouseMove: (e: React.MouseEvent) => handleMove(e.clientX),
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,
    onTouchStart: (e: React.TouchEvent) => handleStart(e.touches[0].clientX),
    onTouchMove: (e: React.TouchEvent) => handleMove(e.touches[0].clientX),
    onTouchEnd: handleEnd,
  };

  const getSwipeDirection = () => {
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
