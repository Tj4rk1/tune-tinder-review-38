
import React, { useEffect, useRef, useState } from 'react';

interface AudioWaveformProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isHovered: boolean;
  currentTime: number;
  duration: number;
}

const AudioWaveform = ({ audioRef, isHovered, currentTime, duration }: AudioWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audioData, setAudioData] = useState<number[]>([]);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    if (!audioRef.current || audioData.length > 0) return;

    const initializeAudioContext = async () => {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(context);

        // Generate mock waveform data for demonstration
        // In a real app, you would analyze the actual audio file
        const mockData = Array.from({ length: 100 }, (_, i) => {
          return 0.3 + Math.sin(i * 0.1) * 0.4 + Math.random() * 0.3;
        });
        setAudioData(mockData);
      } catch (error) {
        console.log('AudioContext not supported, using mock data');
        // Fallback mock data
        const mockData = Array.from({ length: 100 }, (_, i) => {
          return 0.3 + Math.sin(i * 0.1) * 0.4 + Math.random() * 0.3;
        });
        setAudioData(mockData);
      }
    };

    initializeAudioContext();
  }, [audioRef, audioData.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || audioData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const barWidth = width / audioData.length;
      const progress = duration > 0 ? currentTime / duration : 0;

      audioData.forEach((value, index) => {
        const barHeight = value * height * 0.8;
        const x = index * barWidth;
        const y = (height - barHeight) / 2;
        
        // Create gradient based on progress
        const isPlayed = index / audioData.length <= progress;
        
        if (isPlayed) {
          // Played portion - bright gradient
          const gradient = ctx.createLinearGradient(0, 0, 0, height);
          gradient.addColorStop(0, 'rgba(255, 154, 158, 0.9)');
          gradient.addColorStop(0.5, 'rgba(254, 207, 239, 0.9)');
          gradient.addColorStop(1, 'rgba(255, 154, 158, 0.9)');
          ctx.fillStyle = gradient;
        } else {
          // Unplayed portion - dimmer
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        }

        // Draw rounded bars
        ctx.beginPath();
        ctx.roundRect(x + 1, y, barWidth - 2, barHeight, 2);
        ctx.fill();

        // Add glow effect for played portion
        if (isPlayed && isHovered) {
          ctx.shadowColor = 'rgba(255, 154, 158, 0.6)';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
    };

    draw();
  }, [audioData, currentTime, duration, isHovered]);

  return (
    <div 
      className={`absolute inset-0 transition-opacity duration-300 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={60}
        className="w-full h-full"
        style={{ 
          background: 'transparent',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default AudioWaveform;
