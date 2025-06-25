
import React from 'react';
import { Music, Heart, X } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-2xl">
      <div className="p-8 space-y-6">
        {/* Song Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Music className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white truncate" title={song.title}>
            {song.title}
          </h2>
        </div>

        {/* Audio Player */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <AudioPlayer src={song.stream_url} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => onReject(song.id)}
            disabled={isLoading}
            size="lg"
            variant="outline"
            className="flex-1 h-14 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 transition-all duration-200"
          >
            <X className="w-6 h-6 mr-2" />
            Dislike
          </Button>
          
          <Button
            onClick={() => onApprove(song.id)}
            disabled={isLoading}
            size="lg"
            variant="outline"
            className="flex-1 h-14 bg-green-500/10 border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40 text-green-400 hover:text-green-300 transition-all duration-200"
          >
            <Heart className="w-6 h-6 mr-2" />
            Like
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MusicCard;
