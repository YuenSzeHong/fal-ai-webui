import { NextResponse } from 'next/server';

// Upscaling models available in fal.ai
// Based on https://docs.fal.ai/model-apis
const UPSCALING_MODELS = [
  {
    id: 'fal-ai/clarity-upscaler',
    name: 'Clarity Upscaler',
    description: 'High-quality image upscaling with clarity enhancement'
  },
  {
    id: 'fal-ai/creative-upscaler',
    name: 'Creative Upscaler',
    description: 'Creative upscaling with artistic enhancement'
  },
  {
    id: 'fal-ai/recraft-clarity-upscale',
    name: 'Recraft Clarity Upscale',
    description: 'Recraft clarity-focused upscaling'
  },
  {
    id: 'fal-ai/recraft-creative-upscale',
    name: 'Recraft Creative Upscale',
    description: 'Recraft creative upscaling model'
  },
  {
    id: 'fal-ai/video-upscaler',
    name: 'Video Upscaler',
    description: 'Upscale video resolution and quality'
  },
  {
    id: 'fal-ai/fooocus/upscale-or-vary',
    name: 'Fooocus Upscale/Vary',
    description: 'Fooocus upscaling and variation model'
  }
];

export async function GET() {
  return NextResponse.json({ models: UPSCALING_MODELS });
}
