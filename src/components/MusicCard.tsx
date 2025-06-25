import React from 'react';
import { Music, Heart, X } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { Button } from '@/components/ui/button';
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
const MusicCard = ({
  song,
  onApprove,
  onReject,
  isLoading = false
}: MusicCardProps) => {
  return <div className="music-card w-full max-w-sm mx-auto p-8 text-white">
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

      {/* Audio Player */}
      <div className="mb-8">
        <AudioPlayer src={song.stream_url} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button onClick={() => onReject(song.id)} disabled={isLoading} className="glass-button dislike-button flex-1 h-14 rounded-2xl text-white font-medium text-base border-0">
          <X className="w-5 h-5 mr-2" />
          Dislike
        </Button>
        
        <Button onClick={() => onApprove(song.id)} disabled={isLoading} className="glass-button like-button flex-1 h-14 rounded-2xl text-white font-medium text-base border-0">
          <Heart className="w-5 h-5 mr-2" />
          Like
        </Button>
      </div>
    </div>;
};
export default MusicCard;