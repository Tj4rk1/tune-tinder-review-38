
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioPlayerProps {
  src: string;
}

const AudioPlayer = ({ src }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isProgressHovered, setIsProgressHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isVolumeDragging, setIsVolumeDragging] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [src]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const updateProgress = (clientX: number) => {
    const audio = audioRef.current;
    const progressBar = progressBarRef.current;
    if (!audio || !progressBar || !duration) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const updateVolume = (clientX: number) => {
    const volumeBar = volumeBarRef.current;
    if (!volumeBar) return;

    const rect = volumeBar.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newVolume = percentage * 100;
    
    setVolume(newVolume);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    updateProgress(e.clientX);
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    updateProgress(e.clientX);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    updateProgress(e.clientX);
  };

  const handleProgressMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  // Touch handlers for progress bar
  const handleProgressTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    updateProgress(e.touches[0].clientX);
  };

  const handleProgressTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    e.preventDefault();
    updateProgress(e.touches[0].clientX);
  };

  const handleProgressTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  // Volume control handlers
  const handleVolumeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsVolumeDragging(true);
    updateVolume(e.clientX);
  };

  const handleVolumeMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isVolumeDragging) return;
    e.stopPropagation();
    updateVolume(e.clientX);
  };

  const handleVolumeMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsVolumeDragging(false);
  };

  // Touch handlers for volume
  const handleVolumeTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsVolumeDragging(true);
    updateVolume(e.touches[0].clientX);
  };

  const handleVolumeTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isVolumeDragging) return;
    e.stopPropagation();
    e.preventDefault();
    updateVolume(e.touches[0].clientX);
  };

  const handleVolumeTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsVolumeDragging(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-6" data-no-swipe="true">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Play/Pause Button */}
      <div className="flex justify-center mb-8">
        <Button
          onClick={togglePlayPause}
          className="play-button border-0 flex items-center justify-center"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white ml-1" />
          )}
        </Button>
      </div>

      {/* Progress Bar with Enhanced Touch Support */}
      <div className="space-y-3">
        <div 
          className="relative cursor-pointer group"
          onMouseEnter={() => setIsProgressHovered(true)}
          onMouseLeave={() => {
            if (!isDragging) {
              setIsProgressHovered(false);
            }
          }}
          onMouseDown={handleProgressMouseDown}
          onMouseMove={handleProgressMouseMove}
          onMouseUp={handleProgressMouseUp}
          onTouchStart={handleProgressTouchStart}
          onTouchMove={handleProgressTouchMove}
          onTouchEnd={handleProgressTouchEnd}
          ref={progressBarRef}
        >
          {/* Background Track */}
          <div className="progress-bar h-2 md:h-1 w-full transition-all duration-200 group-hover:h-2">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Interactive Slider Handle */}
          <div 
            className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 md:w-4 md:h-4 rounded-full bg-white shadow-lg transition-all duration-200 ${
              isProgressHovered || isDragging 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 md:opacity-0 scale-75'
            }`}
            style={{ 
              left: `calc(${progress}% - ${progress > 95 ? '20px' : progress < 5 ? '0px' : '10px'})`,
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 154, 158, 0.3)'
            }}
          />
          
          {/* Hover Enhancement */}
          <div 
            className={`absolute inset-0 rounded-full transition-all duration-200 ${
              isProgressHovered || isDragging 
                ? 'bg-gradient-to-r from-pink-400/20 to-purple-500/20' 
                : ''
            }`}
            style={{
              backdropFilter: isProgressHovered || isDragging ? 'blur(5px)' : 'none'
            }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-white/80">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Control with Enhanced Touch Support */}
      <div className="flex items-center gap-3 pt-4">
        <Volume2 className="w-4 h-4 text-white/70" />
        <div 
          className="flex-1 relative group cursor-pointer"
          onMouseDown={handleVolumeMouseDown}
          onMouseMove={handleVolumeMouseMove}
          onMouseUp={handleVolumeMouseUp}
          onTouchStart={handleVolumeTouchStart}
          onTouchMove={handleVolumeTouchMove}
          onTouchEnd={handleVolumeTouchEnd}
          ref={volumeBarRef}
        >
          <div className="progress-bar h-2 md:h-1 w-full transition-all duration-200 group-hover:h-2">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${volume}%` }}
            />
          </div>
          
          {/* Volume Handle */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 md:w-3 md:h-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
            style={{ 
              left: `calc(${volume}% - ${volume > 95 ? '16px' : volume < 5 ? '0px' : '8px'})`,
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
