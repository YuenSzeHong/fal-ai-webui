import { NextResponse } from 'next/server';
import { createModelResponse } from '../model-response-helper';
import cache, { CACHE_DURATIONS } from '@/lib/cache';
import { fetchFalModels, filterModelsByCategory, convertToModelInfo } from '@/lib/fal-models-api';

// Force dynamic rendering - don't prerender during build
export const dynamic = 'force-dynamic';

const CACHE_KEY = 'models:image-to-3d';

async function getDynamicModels() {
  try {
    console.log('[Dynamic Fetch] Attempting to fetch models from fal.ai Platform API');
    const allModels = await fetchFalModels();
    const filtered = filterModelsByCategory(allModels, 'image-to-3d');
    const models = filtered.map(convertToModelInfo);
    
    if (models.length > 0) {
      console.log(`[Dynamic Fetch] Successfully fetched ${models.length} image-to-3d models`);
      return models;
    }
    throw new Error('No image-to-3d models found');
  } catch (error) {
    console.error('[Dynamic Fetch] Failed:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  // Check cache first
  const cachedModels = cache.get<ReturnType<typeof convertToModelInfo>[]>(CACHE_KEY);
  if (cachedModels) {
    console.log('[Cache HIT] image-to-3d models');
    return createModelResponse('image-to-3d', cachedModels, request);
  }

  console.log('[Cache MISS] image-to-3d models');
  
  // Try dynamic fetch
  try {
    const dynamicModels = await getDynamicModels();
    
    if (dynamicModels && dynamicModels.length > 0) {
      console.log(`[Dynamic Models] Using ${dynamicModels.length} models from fal.ai API`);
      cache.set(CACHE_KEY, dynamicModels, CACHE_DURATIONS.MODEL_LIST);
      return createModelResponse('image-to-3d', dynamicModels, request);
    }
    
    // No models found
    return NextResponse.json(
      { 
        error: 'No models available',
        message: 'Failed to fetch image-to-3d models from fal.ai API. No models found.',
        models: [] 
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('[Server] Error fetching image-to-3d models:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch models',
        message: 'Unable to connect to fal.ai API. Please try again later.',
        models: [] 
      },
      { status: 503 }
    );
  }
}
