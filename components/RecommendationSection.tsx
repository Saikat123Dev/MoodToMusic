import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Music, Play, Pause } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface RecommendationSectionProps {
  recommendations: any;
}

export default function RecommendationSection({ recommendations }: RecommendationSectionProps) {
  const songs = recommendations?.recommendations || [];
  const hasRecommendations = songs.length > 0;

  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const handlePlayAudio = (previewUrl: string, songId: string) => {
    if (currentAudio && currentSongId !== songId) {
      currentAudio.pause();
      setIsPlaying(false);
    }

    const audio = new Audio(previewUrl);
    audio.play();
    setCurrentAudio(audio);
    setIsPlaying(true);
    setCurrentSongId(songId);

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentSongId(null);
    };

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };

    audio.ontimeupdate = () => {
      setAudioProgress(audio.currentTime);
    };
  };

  const handlePauseAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    }
  };

  const handleSeekAudio = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (currentAudio) {
      const newTime = parseFloat(event.target.value);
      currentAudio.currentTime = newTime;
      setAudioProgress(newTime);
    }
  };

  return (
    <Card className="col-span-2 p-6 bg-gradient-to-b from-green-800 to-black text-white">
      <motion.h2
        className="mb-4 text-2xl font-bold"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Recommended Songs
      </motion.h2>
      {hasRecommendations ? (
        <ScrollArea className="h-[400px] rounded-md border p-4 bg-gray-900/20">
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
          >
            {songs.map((song: any) => (
              <motion.div
                key={song.id}
                className="flex flex-col rounded-lg border bg-gray-800"
                whileHover={{ scale: 1.02 }}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4 w-2/3"> {/* Fixed width for metadata */}
                    {song.image ? (
                      <motion.img
                        src={song.image}
                        alt={song.title}
                        className="h-12 w-12 rounded-md object-cover"
                        animate={
                          isPlaying && currentAudio?.src === song.preview
                            ? { rotate: 360 }
                            : { rotate: 0 }
                        }
                        transition={
                          isPlaying && currentAudio?.src === song.preview
                            ? { repeat: Infinity, ease: "linear", duration: 4 }
                            : { duration: 0, ease: "easeOut" }  // Smooth stop when playback ends
                        }
                      />

                    ) : (
                      <Music className="h-8 w-8 text-primary" />
                    )}
                    <div>
                      <h3 className="font-semibold">{song.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {song.artist} • {song.genre}
                      </p>
                    </div>
                  </div>

                  {/* Fixed width for the play/pause button and additional actions */}
                  <div className="flex items-center space-x-2 w-1/3 justify-end">
                    <motion.button
                      className="rounded-full p-2 hover:bg-primary/10"
                      onClick={() => {
                        if (song.preview) {
                          if (isPlaying && currentAudio?.src === song.preview) {
                            handlePauseAudio();
                          } else {
                            handlePlayAudio(song.preview.toString(), song.id?.toString() || '');
                          }
                        }
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isPlaying && currentAudio?.src === song.preview ? (
                        <Pause className="h-6 w-6 text-primary" />
                      ) : (
                        <Play className="h-6 w-6 text-primary" />
                      )}
                    </motion.button>
                    <span className="text-sm text-muted-foreground">Preview</span>
                    {song.url && (
                      <a
                        href={song.url.toString()}
                        target="_blank"
                        className="text-sm text-blue-500 hover:underline"
                        rel="noopener noreferrer"
                      >
                        → Full Song
                      </a>
                    )}
                  </div>
                </div>

                {/* Audio controls - only shown when playing */}
                {isPlaying && currentAudio?.src === song.preview && (
                  <motion.div
                    className="px-4 pb-4 w-full border-t"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <input
                      type="range"
                      value={audioProgress}
                      min="0"
                      max={duration}
                      step="0.1"
                      onChange={handleSeekAudio}
                      className="w-full h-2 bg-gray-300 rounded-md mt-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{Math.floor(audioProgress)}s</span>
                      <span>{Math.floor(duration)}s</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </ScrollArea>
      ) : (
        <div className="flex h-[400px] items-center justify-center text-center text-muted-foreground">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Music className="mx-auto mb-4 h-12 w-12" />
            <p>Upload an image to get music recommendations</p>
          </motion.div>
        </div>
      )}
    </Card>
  );
}
