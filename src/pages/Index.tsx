
import React, { useState, useEffect } from 'react';
import MusicCard from '@/components/MusicCard';
import CompletionMessage from '@/components/CompletionMessage';
import { Button } from '@/components/ui/button';
import { RefreshCw, Music } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock data for development - this will be replaced with Supabase data
const mockSongs = [
  {
    id: '1',
    title: 'Ethereal Dreams',
    stream_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    approved: null
  },
  {
    id: '2',
    title: 'Digital Horizons',
    stream_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    approved: null
  },
  {
    id: '3',
    title: 'Synthetic Melodies',
    stream_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    approved: null
  }
];

interface Song {
  id: string;
  title: string;
  stream_url: string;
  approved: boolean | null;
}

const Index = () => {
  const [songs, setSongs] = useState<Song[]>(mockSongs);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get next unreviewed song
  const getNextSong = () => {
    const unreviewed = songs.filter(song => song.approved === null);
    return unreviewed.length > 0 ? unreviewed[0] : null;
  };

  useEffect(() => {
    setCurrentSong(getNextSong());
  }, [songs]);

  const handleApprove = async (songId: string) => {
    setIsLoading(true);
    console.log('Approving song:', songId);

    try {
      // Update local state (in real app, this would update Supabase)
      setSongs(prev => prev.map(song => 
        song.id === songId ? { ...song, approved: true } : song
      ));

      // Optional webhook call for approved songs
      try {
        await fetch('https://n8n.stoked-ai.com/webhook/song-approved', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ song_id: songId }),
        });
        console.log('Webhook called successfully');
      } catch (webhookError) {
        console.log('Webhook call failed (optional):', webhookError);
      }

      toast({
        title: "Track Approved! ✅",
        description: "Moving to next track...",
      });
    } catch (error) {
      console.error('Error approving song:', error);
      toast({
        title: "Error",
        description: "Failed to approve track. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (songId: string) => {
    setIsLoading(true);
    console.log('Rejecting song:', songId);

    try {
      // Update local state (in real app, this would update Supabase)
      setSongs(prev => prev.map(song => 
        song.id === songId ? { ...song, approved: false } : song
      ));

      toast({
        title: "Track Rejected ❌",
        description: "Moving to next track...",
      });
    } catch (error) {
      console.error('Error rejecting song:', error);
      toast({
        title: "Error",
        description: "Failed to reject track. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetReviews = () => {
    setSongs(mockSongs);
    toast({
      title: "Reviews Reset",
      description: "All tracks are available for review again.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex flex-col">
      {/* Header */}
      <header className="p-6 text-center border-b border-gray-800">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">AI Music Review</h1>
        </div>
        <p className="text-gray-400">Swipe through AI-generated tracks • Like or dislike to review</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        {currentSong ? (
          <div className="w-full max-w-md">
            <MusicCard
              song={currentSong}
              onApprove={handleApprove}
              onReject={handleReject}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <CompletionMessage />
            <div className="text-center">
              <Button
                onClick={resetReviews}
                variant="outline"
                className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset for Demo
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-gray-500 text-sm border-t border-gray-800">
        <div className="flex items-center justify-center gap-4">
          <span>Reviewed: {songs.filter(s => s.approved !== null).length}</span>
          <span>•</span>
          <span>Remaining: {songs.filter(s => s.approved === null).length}</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
