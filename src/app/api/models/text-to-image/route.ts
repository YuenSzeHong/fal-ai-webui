import { NextResponse } from 'next/server';
import { createModelResponse } from '../model-response-helper';
import cache, { CACHE_DURATIONS } from '@/lib/cache';
import { fetchFalModels, filterModelsByCategory, convertToModelInfo } from '@/lib/fal-models-api';

const CACHE_KEY = 'models:text-to-image';

async function getDynamicModels() {
  try {
    console.log('[Dynamic Fetch] Attempting to fetch models from fal.ai Platform API');
    const allModels = await fetchFalModels();
    const filtered = filterModelsByCategory(allModels, 'text-to-image');
    const models = filtered.map(convertToModelInfo);
    
    if (models.length > 0) {
      console.log(`[Dynamic Fetch] Successfully fetched ${models.length} text-to-image models`);
      return models;
    }
    throw new Error('No text-to-image models found');
  } catch (error) {
    console.error('[Dynamic Fetch] Failed:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  // Check cache first
  const cachedModels = cache.get<ReturnType<typeof convertToModelInfo>[]>(CACHE_KEY);
  if (cachedModels) {
    console.log('[Cache HIT] text-to-image models');
    return createModelResponse('text-to-image', cachedModels, request);
  }

  console.log('[Cache MISS] text-to-image models');
  
  // Try dynamic fetch
  try {
    const dynamicModels = await getDynamicModels();
    
    if (dynamicModels && dynamicModels.length > 0) {
      console.log(`[Dynamic Models] Using ${dynamicModels.length} models from fal.ai API`);
      cache.set(CACHE_KEY, dynamicModels, CACHE_DURATIONS.MODEL_LIST);
      return createModelResponse('text-to-image', dynamicModels, request);
    }
    
    // No models found
    return NextResponse.json(
      { 
        error: 'No models available',
        message: 'Failed to fetch text-to-image models from fal.ai API. No models found.',
        models: [] 
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('[Server] Error fetching text-to-image models:', error);
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
