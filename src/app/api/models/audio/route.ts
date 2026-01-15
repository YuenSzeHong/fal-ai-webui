import { NextResponse } from 'next/server';
import { createModelResponse } from '../model-response-helper';
import cache, { CACHE_DURATIONS } from '@/lib/cache';
import { fetchFalModels, filterModelsByCategory, convertToModelInfo } from '@/lib/fal-models-api';

// Force dynamic rendering - don't prerender during build
export const dynamic = 'force-dynamic';

const CACHE_KEY = 'models:audio';
const CATEGORY = 'audio';

async function getDynamicModels() {
  try {
    console.log(`[${CATEGORY}] Fetching from fal.ai Platform API with category filter`);
    
    // Try fetching with category parameter first (most efficient)
    let models = await fetchFalModels({ category: CATEGORY, status: 'active', limit: 100 });
    
    // If category filter doesn't return results, fetch all and filter locally
    if (models.length === 0) {
      console.log(`[${CATEGORY}] Category filter returned no results, fetching all models`);
      const allModels = await fetchFalModels({ status: 'active', limit: 500 });
      models = filterModelsByCategory(allModels, CATEGORY);
    }
    
    const converted = models.map(convertToModelInfo);
    
    if (converted.length === 0) {
      throw new Error(`No ${CATEGORY} models found in fal.ai API`);
    }
    
    console.log(`[${CATEGORY}] Successfully fetched ${converted.length} models`);
    return converted;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[${CATEGORY}] Error:`, errorMessage);
    throw error;
  }
}

export async function GET(request: Request) {
  // Check cache first
  const cachedModels = cache.get<ReturnType<typeof convertToModelInfo>[]>(CACHE_KEY);
  if (cachedModels) {
    console.log(`[Cache HIT] ${CATEGORY} models (${cachedModels.length} models)`);
    return createModelResponse(CATEGORY, cachedModels, request);
  }

  console.log(`[Cache MISS] ${CATEGORY} models - fetching from fal.ai`);
  
  // Fetch from fal.ai Platform API
  try {
    const dynamicModels = await getDynamicModels();
    
    // Cache the results
    cache.set(CACHE_KEY, dynamicModels, CACHE_DURATIONS.MODEL_LIST);
    console.log(`[${CATEGORY}] Cached ${dynamicModels.length} models for ${CACHE_DURATIONS.MODEL_LIST / 1000 / 60} minutes`);
    
    return createModelResponse(CATEGORY, dynamicModels, request);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${CATEGORY}] Fatal error:`, errorMessage);
    
    return NextResponse.json(
      { 
        error: 'Service temporarily unavailable',
        message: `Unable to fetch ${CATEGORY} models from fal.ai API: ${errorMessage}`,
        details: 'The fal.ai Platform API is currently unavailable. Please try again in a few moments.',
        models: [] 
      },
      { status: 503 }
    );
  }
}
