import { NextResponse } from 'next/server';
import { createModelResponse } from '../model-response-helper';
import cache, { CACHE_DURATIONS } from '@/lib/cache';

const CACHE_KEY = 'models:image-to-3d';

// Image-to-3D models available in fal.ai
// Based on https://docs.fal.ai/model-apis
const IMAGE_TO_3D_MODELS = [
  {
    id: 'fal-ai/era-3d',
    name: 'Era-3D',
    description: 'Generate 3D models from images'
  },
  {
    id: 'fal-ai/hyper3d/rodin',
    name: 'Hyper3D Rodin',
    description: 'Hyper3D Rodin image-to-3D generation'
  }
];

export async function GET(request: Request) {
  const cachedModels = cache.get<typeof IMAGE_TO_3D_MODELS>(CACHE_KEY);
  if (cachedModels) {
    console.log('[Cache HIT] image-to-3d models');
    return createModelResponse('image-to-3d', cachedModels, request);
  }
  console.log('[Cache MISS] image-to-3d models');
  cache.set(CACHE_KEY, IMAGE_TO_3D_MODELS, CACHE_DURATIONS.MODEL_LIST);
  return createModelResponse('image-to-3d', IMAGE_TO_3D_MODELS, request);
}
