import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AudioWaveform from './AudioWaveform';

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

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

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressBarRef.current;
    if (!audio || !progressBar || !duration) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressClick(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleProgressClick(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-6">
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

      {/* Progress Bar with Waveform and Hover Slider */}
      <div className="space-y-3">
        <div 
          className="relative cursor-pointer group h-15"
          onMouseEnter={() => setIsProgressHovered(true)}
          onMouseLeave={() => {
            if (!isDragging) {
              setIsProgressHovered(false);
            }
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={progressBarRef}
        >
          {/* Waveform Background - appears on hover */}
          <AudioWaveform 
            audioRef={audioRef}
            isHovered={isProgressHovered || isDragging}
            currentTime={currentTime}
            duration={duration}
          />
          
          {/* Traditional Progress Bar - always visible */}
          <div className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${
            isProgressHovered || isDragging ? 'opacity-50' : 'opacity-100'
          }`}>
            <div className="progress-bar h-1 w-full transition-all duration-200 group-hover:h-2">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {/* Interactive Slider Handle - appears on hover */}
          <div 
            className={`absolute bottom-0 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg transition-all duration-200 ${
              isProgressHovered || isDragging 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-75'
            }`}
            style={{ 
              left: `calc(${progress}% - 8px)`,
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
                ? 'bg-gradient-to-r from-pink-400/10 to-purple-500/10' 
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

      {/* Volume Control */}
      <div className="flex items-center gap-3 pt-4">
        <Volume2 className="w-4 h-4 text-white/70" />
        <div className="flex-1 relative group">
          <div className="progress-bar h-1 w-full transition-all duration-200 group-hover:h-2">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${volume}%` }}
            />
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          {/* Volume Handle */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
            style={{ 
              left: `calc(${volume}% - 6px)`,
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
