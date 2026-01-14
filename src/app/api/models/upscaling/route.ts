import { NextResponse } from 'next/server';
import { createModelResponse } from '../model-response-helper';
import cache, { CACHE_DURATIONS } from '@/lib/cache';

const CACHE_KEY = 'models:upscaling';

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

export async function GET(request: Request) {
  const cachedModels = cache.get<typeof UPSCALING_MODELS>(CACHE_KEY);
  if (cachedModels) {
    console.log('[Cache HIT] upscaling models');
    return createModelResponse('upscaling', cachedModels, request);
  }
  console.log('[Cache MISS] upscaling models');
  cache.set(CACHE_KEY, UPSCALING_MODELS, CACHE_DURATIONS.MODEL_LIST);
  return createModelResponse('upscaling', UPSCALING_MODELS, request);
}
}
