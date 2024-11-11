export const dynamic = 'force-dynamic';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('image') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      'Analyze this image and describe the mood or emotion it conveys. Focus on the overall atmosphere, colors, and any facial expressions if present. Provide your response in JSON format with these fields: dominantEmotion (single word), moodDescription (2-3 sentences), suggestedMusicGenres (array of 3 genres that match the mood), colorPalette (array of 3 dominant colors in hex format)',
      {
        inlineData: {
          mimeType: file.type,
          data: base64Image,
        },
      },
    ]);

    const response = await result.response;
    let analysisText = await response.text();

    // Attempt to strip extraneous characters if present
    analysisText = analysisText.trim();
    if (analysisText.startsWith('```json')) {
      analysisText = analysisText.slice(7); // Remove the initial "```json"
    }
    if (analysisText.endsWith('```')) {
      analysisText = analysisText.slice(0, -3); // Remove the ending "```"
    }

    const analysis = JSON.parse(analysisText);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
