
import React from 'react';
import { Music, Heart, X } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import SwipeOverlay from './SwipeOverlay';
import { Button } from '@/components/ui/button';
import { useSwipe } from '@/hooks/useSwipe';

interface Song {
  id: string;
  title: string;
  stream_url: string;
  approved: boolean | null;
}

interface MusicCardProps {
  song: Song;
  onApprove: (songId: string) => void;
  onReject: (songId: string) => void;
  isLoading?: boolean;
}

const MusicCard = ({ song, onApprove, onReject, isLoading = false }: MusicCardProps) => {
  const { handlers, dragPosition, swipeDirection, swipeIntensity, isDragging } = useSwipe({
    onSwipeLeft: () => onReject(song.id),
    onSwipeRight: () => onApprove(song.id),
    threshold: 100,
  });

  const rotation = dragPosition * 0.1;
  const scale = isDragging ? 0.95 : 1;

  return (
    <div
      className={`music-card w-full max-w-sm mx-auto p-8 text-white relative cursor-grab transition-all duration-200 ${
        isDragging ? 'cursor-grabbing shadow-2xl' : ''
      }`}
      style={{
        transform: `translateX(${dragPosition}px) rotate(${rotation}deg) scale(${scale})`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      {...handlers}
    >
      {/* Swipe Overlay */}
      <SwipeOverlay direction={swipeDirection} intensity={swipeIntensity} />

      {/* Music Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center bg-[#39eb39]">
          <Music className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Song Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2" title={song.title}>
          {song.title || "Chasing Neon Dreams"}
        </h2>
      </div>

      {/* Audio Player - No Swipe Zone */}
      <div className="mb-8">
        <AudioPlayer src={song.stream_url} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button 
          onClick={() => onReject(song.id)} 
          disabled={isLoading || isDragging} 
          className="glass-button dislike-button flex-1 h-14 rounded-2xl text-white font-medium text-base border-0"
        >
          <X className="w-5 h-5 mr-2" />
          Dislike
        </Button>
        
        <Button 
          onClick={() => onApprove(song.id)} 
          disabled={isLoading || isDragging} 
          className="glass-button like-button flex-1 h-14 rounded-2xl text-white font-medium text-base border-0"
        >
          <Heart className="w-5 h-5 mr-2" />
          Like
        </Button>
      </div>

      {/* Swipe Instructions for Mobile */}
      <div className="mt-4 text-center md:hidden">
        <p className="text-white/50 text-xs">
          Swipe left to dislike • Swipe right to like
        </p>
        <p className="text-white/30 text-xs mt-1">
          (Audio controls don't trigger swipe)
        </p>
      </div>
    </div>
  );
};

export default MusicCard;
