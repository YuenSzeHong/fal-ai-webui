import { NextResponse } from 'next/server';
import { createModelResponse } from '../model-response-helper';
import cache, { CACHE_DURATIONS } from '@/lib/cache';

const CACHE_KEY = 'models:video-to-video';

// Video-to-video models available in fal.ai
// Based on https://docs.fal.ai/model-apis
const VIDEO_TO_VIDEO_MODELS = [
  {
    id: 'fal-ai/cogvideox-5b/video-to-video',
    name: 'CogVideoX-5B V2V',
    description: 'CogVideoX 5B video-to-video transformation'
  },
  {
    id: 'fal-ai/fast-animatediff/video-to-video',
    name: 'Fast AnimateDiff V2V',
    description: 'Fast AnimateDiff video-to-video'
  },
  {
    id: 'fal-ai/fast-animatediff/turbo/video-to-video',
    name: 'Fast AnimateDiff Turbo V2V',
    description: 'Turbo AnimateDiff video-to-video'
  }
];

export async function GET(request: Request) {
  const cachedModels = cache.get<typeof VIDEO_TO_VIDEO_MODELS>(CACHE_KEY);
  if (cachedModels) {
    console.log('[Cache HIT] video-to-video models');
    return createModelResponse('video-to-video', cachedModels, request);
  }
  console.log('[Cache MISS] video-to-video models');
  cache.set(CACHE_KEY, VIDEO_TO_VIDEO_MODELS, CACHE_DURATIONS.MODEL_LIST);
  return createModelResponse('video-to-video', VIDEO_TO_VIDEO_MODELS, request);
}
