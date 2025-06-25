
import React from 'react';
import { Heart, X } from 'lucide-react';

interface SwipeOverlayProps {
  direction: 'left' | 'right' | 'none';
  intensity: number;
}

const SwipeOverlay = ({ direction, intensity }: SwipeOverlayProps) => {
  if (direction === 'none') return null;

  const isLike = direction === 'right';
  const opacity = intensity * 0.8;
  
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-3xl transition-all duration-200"
      style={{
        backgroundColor: isLike ? `rgba(34, 197, 94, ${opacity * 0.3})` : `rgba(239, 68, 68, ${opacity * 0.3})`,
        borderColor: isLike ? `rgba(34, 197, 94, ${opacity})` : `rgba(239, 68, 68, ${opacity})`,
        borderWidth: '2px',
        borderStyle: 'solid',
      }}
    >
      <div 
        className={`flex flex-col items-center gap-2 transform transition-all duration-200 ${
          intensity > 0.5 ? 'scale-110' : 'scale-100'
        }`}
        style={{ opacity: intensity }}
      >
        {isLike ? (
          <>
            <Heart className="w-16 h-16 text-green-500 fill-current" />
            <span className="text-2xl font-bold text-green-500 tracking-wider">LIKE</span>
          </>
        ) : (
          <>
            <X className="w-16 h-16 text-red-500" strokeWidth={3} />
            <span className="text-2xl font-bold text-red-500 tracking-wider">DISLIKE</span>
          </>
        )}
      </div>
    </div>
  );
};

export default SwipeOverlay;
