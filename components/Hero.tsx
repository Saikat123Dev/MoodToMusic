import { Music } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-background py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 flex justify-center">
            <Music className="h-16 w-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
            Mood to Music
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Upload a photo or take a picture, and let us recommend the perfect music
            to match your mood. Our AI analyzes the emotions and atmosphere in your
            images to create a personalized playlist.
          </p>
        </div>
      </div>
    </div>
  );
}