"use client";
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
// Import the Song type

interface ImageUploadProps {
  onRecommendationsUpdate: (recommendations: any) => void;
}

export default function ImageUpload({ onRecommendationsUpdate }: ImageUploadProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Analyze image
  const analyzeImage = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Call the analyze API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();

      // Get music recommendations based on analysis
      const recommendationsResponse = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!recommendationsResponse.ok) {
        throw new Error('Failed to get recommendations');
      }

      const recommendationsData = await recommendationsResponse.json();

      // Update recommendations in parent component
      onRecommendationsUpdate(recommendationsData);

      // Show the detected emotion and log recommendations data
      toast({
        title: 'Analysis Complete',
        description: `Detected mood: ${data.dominantEmotion}`,
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to analyze image',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [onRecommendationsUpdate, toast]);

  // Handle file drop
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setImage(URL.createObjectURL(file));
        await analyzeImage(file);
      }
    },
    [analyzeImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
  });

  return (
    <Card className="p-6">
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center hover:border-primary/50 ${isDragActive ? 'border-primary' : 'border-muted-foreground/25'
          }`}
      >
        <input {...getInputProps()} />
        {image ? (
          <div className="space-y-4">
            <img
              src={image}
              alt="Uploaded"
              className="mx-auto max-h-64 rounded-lg object-cover"
            />
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setImage(null);
              }}
              disabled={isAnalyzing}
            >
              Remove Image
            </Button>
          </div>
        ) : (
          <>
            <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              Drag & drop an image here, or click to select
            </p>
          </>
        )}
      </div>

      <div className="mt-4 flex justify-center space-x-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            toast({
              title: 'Coming Soon',
              description: 'Camera capture will be available soon!',
            });
          }}
          disabled={isAnalyzing}
        >
          <Camera className="mr-2 h-4 w-4" />
          Take Photo
        </Button>
      </div>
    </Card>
  );
}
