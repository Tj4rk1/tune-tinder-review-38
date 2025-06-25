
import React, { useState, useEffect } from 'react';
import MusicCard from '@/components/MusicCard';
import CompletionMessage from '@/components/CompletionMessage';
import { Button } from '@/components/ui/button';
import { RefreshCw, Music } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Song {
  id: number;
  name: string;
  streamURL: string;
  Approved: string | null;
}

const Index = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch songs from Supabase
  const fetchSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('Storage Generative Music')
        .select('id, name, streamURL, Approved')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching songs:', error);
        toast({
          title: "Error",
          description: "Failed to load tracks from database.",
          variant: "destructive",
        });
        return;
      }

      console.log('Fetched songs:', data);
      console.log('Raw data for debugging:', JSON.stringify(data, null, 2));
      setSongs(data || []);
    } catch (error) {
      console.error('Error fetching songs:', error);
      toast({
        title: "Error",
        description: "Failed to connect to database.",
        variant: "destructive",
      });
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Get next unreviewed song - check for null, undefined, or empty string
  const getNextSong = () => {
    const unreviewed = songs.filter(song => {
      const isUnreviewed = song.Approved === null || 
                          song.Approved === undefined || 
                          song.Approved === '' || 
                          song.Approved === 'NULL';
      console.log(`Song ${song.id} (${song.name}): Approved="${song.Approved}", isUnreviewed=${isUnreviewed}`);
      return isUnreviewed;
    });
    console.log('Total songs:', songs.length);
    console.log('Unreviewed songs:', unreviewed.length, unreviewed);
    return unreviewed.length > 0 ? unreviewed[0] : null;
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    console.log('Setting current song from songs:', songs.length);
    setCurrentSong(getNextSong());
  }, [songs]);

  const handleApprove = async (songId: number) => {
    setIsLoading(true);
    console.log('Approving song:', songId);

    try {
      // Update song in Supabase with "yes" for approved
      const { error } = await supabase
        .from('Storage Generative Music')
        .update({ Approved: 'yes' })
        .eq('id', songId);

      if (error) {
        console.error('Error updating song:', error);
        toast({
          title: "Error",
          description: "Failed to approve track. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setSongs(prev => prev.map(song => 
        song.id === songId ? { ...song, Approved: 'yes' } : song
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

  const handleReject = async (songId: number) => {
    setIsLoading(true);
    console.log('Rejecting song:', songId);

    try {
      // Update song in Supabase with "no" for rejected
      const { error } = await supabase
        .from('Storage Generative Music')
        .update({ Approved: 'no' })
        .eq('id', songId);

      if (error) {
        console.error('Error updating song:', error);
        toast({
          title: "Error",
          description: "Failed to reject track. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setSongs(prev => prev.map(song => 
        song.id === songId ? { ...song, Approved: 'no' } : song
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

  const refreshSongs = () => {
    setIsInitialLoading(true);
    fetchSongs();
    toast({
      title: "Refreshed",
      description: "Loaded latest tracks from database.",
    });
  };

  // Helper function to count unreviewed songs
  const getUnreviewedCount = () => {
    return songs.filter(s => 
      s.Approved === null || 
      s.Approved === undefined || 
      s.Approved === '' || 
      s.Approved === 'NULL'
    ).length;
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
            <Music className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-400">Loading tracks...</p>
        </div>
      </div>
    );
  }

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
              song={{
                id: currentSong.id.toString(),
                title: currentSong.name || 'Untitled Track',
                stream_url: currentSong.streamURL || '',
                approved: currentSong.Approved === 'yes' ? true : currentSong.Approved === null ? null : false
              }}
              onApprove={() => handleApprove(currentSong.id)}
              onReject={() => handleReject(currentSong.id)}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <CompletionMessage />
            <div className="text-center">
              <Button
                onClick={refreshSongs}
                variant="outline"
                className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Tracks
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-gray-500 text-sm border-t border-gray-800">
        <div className="flex items-center justify-center gap-4">
          <span>Approved: {songs.filter(s => s.Approved === 'yes').length}</span>
          <span>•</span>
          <span>Rejected: {songs.filter(s => s.Approved === 'no').length}</span>
          <span>•</span>
          <span>Remaining: {getUnreviewedCount()}</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
