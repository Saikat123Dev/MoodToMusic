"use client";
import { useState } from 'react';
import Hero from '@/components/Hero';
import ImageUpload from '@/components/ImageUpload';
import RecommendationSection from '@/components/RecommendationSection';
// Import the Song type

export default function Home() {
  const [recommendations, setRecommendations] = useState([]);

  // Callback function to update recommendations
  const updateRecommendations = (data: any) => {
    setRecommendations(data);
  };

  console.log(recommendations);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary">

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <ImageUpload onRecommendationsUpdate={updateRecommendations} />
          <RecommendationSection recommendations={recommendations} />

        </div>
      </div>
    </main>
  );
}
