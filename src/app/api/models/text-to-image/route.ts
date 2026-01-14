import { NextResponse } from 'next/server';
import { createModelResponse } from '../model-response-helper';
import cache, { CACHE_DURATIONS } from '@/lib/cache';
import { fetchFalModels, filterModelsByCategory, convertToModelInfo } from '@/lib/fal-models-api';

const CACHE_KEY = 'models:text-to-image';

// Fallback text-to-image models (used if dynamic fetch fails or is disabled)
// Based on https://docs.fal.ai/model-apis
const TEXT_TO_IMAGE_MODELS = [
  {
    id: 'fal-ai/flux-pro/v1.1-ultra',
    name: 'FLUX1.1 [pro] ultra',
    description: 'Ultra quality FLUX Pro model with advanced capabilities',
    supportsSafetyFilter: true
  },
  {
    id: 'fal-ai/flux-pro/v1.1',
    name: 'FLUX1.1 [pro]',
    description: 'High quality FLUX Pro model',
    supportsSafetyFilter: true
  },
  {
    id: 'fal-ai/flux/dev',
    name: 'FLUX [dev]',
    description: 'Development version of FLUX',
    supportsSafetyFilter: true
  },
  {
    id: 'fal-ai/flux/schnell',
    name: 'FLUX [schnell]',
    description: 'Fast FLUX model for quick generation',
    supportsSafetyFilter: true
  },
  {
    id: 'fal-ai/flux-lora',
    name: 'FLUX LoRA',
    description: 'FLUX with LoRA fine-tuning support',
    supportsSafetyFilter: true
  },
  {
    id: 'fal-ai/lora',
    name: 'LoRA',
    description: 'General LoRA model with custom styles',
    supportsSafetyFilter: false,
    safetyFilterNote: 'Safety filter cannot be disabled on this model'
  },
  {
    id: 'fal-ai/flux-subject',
    name: 'FLUX Subject',
    description: 'FLUX with subject consistency',
    supportsSafetyFilter: true
  },
  {
    id: 'fal-ai/flux-general',
    name: 'FLUX General',
    description: 'General purpose FLUX model',
    supportsSafetyFilter: true
  },
  {
    id: 'fal-ai/aura-flow',
    name: 'Aura Flow',
    description: 'Aura Flow text-to-image model',
    supportsSafetyFilter: false,
    safetyFilterNote: 'Safety filter always enabled on this model'
  },
  {
    id: 'fal-ai/recraft-v3',
    name: 'Recraft V3',
    description: 'Recraft V3 generation model',
    supportsSafetyFilter: false,
    safetyFilterNote: 'Safety filter always enabled on this model'
  },
  {
    id: 'fal-ai/recraft-20b',
    name: 'Recraft 20B',
    description: 'Recraft 20B parameter model',
    supportsSafetyFilter: false,
    safetyFilterNote: 'Safety filter always enabled on this model'
  },

  {
    id: 'fal-ai/ideogram/v2',
    name: 'Ideogram V2',
    description: 'Ideogram V2 text-to-image generation',
    supportsSafetyFilter: false,
    safetyFilterNote: 'Safety filter always enabled on this model'
  },
  {
    id: 'fal-ai/ideogram/v2/turbo',
    name: 'Ideogram V2 Turbo',
    description: 'Fast Ideogram V2 generation',
    supportsSafetyFilter: false,
    safetyFilterNote: 'Safety filter always enabled on this model'
  },
  {
    id: 'fal-ai/omnigen-v1',
    name: 'OmniGen V1',
    description: 'OmniGen multi-modal generation',
    supportsSafetyFilter: false,
    safetyFilterNote: 'Safety filter always enabled on this model'
  },
  {
    id: 'fal-ai/sana',
    name: 'Sana',
    description: 'Sana text-to-image model',
    supportsSafetyFilter: true
  },

  {
    id: 'fal-ai/kolors',
    name: 'Kolors',
    description: 'Kolors text-to-image generation',
    supportsSafetyFilter: false,
    safetyFilterNote: 'Safety filter always enabled on this model'
  },
  {
    id: 'fal-ai/pixart-sigma',
    name: 'PixArt-Σ',
    description: 'PixArt Sigma high-quality generation',
    supportsSafetyFilter: false,
    safetyFilterNote: 'Safety filter always enabled on this model'
  },
  {
    id: 'fal-ai/luma-photon',
    name: 'Luma Photon',
    description: 'Luma Photon image generation',
    supportsSafetyFilter: false,
    safetyFilterNote: 'Safety filter always enabled on this model'
  },
  {
    id: 'fal-ai/luma-photon/flash',
    name: 'Luma Photon Flash',
    description: 'Fast Luma Photon generation',
    supportsSafetyFilter: false,
    safetyFilterNote: 'Safety filter always enabled on this model'
  }
];

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
    return null;
  } catch (error) {
    console.error('[Dynamic Fetch] Failed:', error);
    return null;
  }
}

export async function GET(request: Request) {
  // Check cache first
  const cachedModels = cache.get<typeof TEXT_TO_IMAGE_MODELS>(CACHE_KEY);
  if (cachedModels) {
    console.log('[Cache HIT] text-to-image models');
    return createModelResponse('text-to-image', cachedModels, request);
  }

  console.log('[Cache MISS] text-to-image models');
  
  // Try dynamic fetch if enabled
  const dynamicModels = await getDynamicModels();
  
  if (dynamicModels && dynamicModels.length > 0) {
    console.log(`[Dynamic Models] Using ${dynamicModels.length} models from fal.ai API`);
    cache.set(CACHE_KEY, dynamicModels, CACHE_DURATIONS.MODEL_LIST);
    return createModelResponse('text-to-image', dynamicModels, request);
  }
  
  // Fallback to hardcoded models
  console.log('[Fallback] Using hardcoded model list');
  cache.set(CACHE_KEY, TEXT_TO_IMAGE_MODELS, CACHE_DURATIONS.MODEL_LIST);
  return createModelResponse('text-to-image', TEXT_TO_IMAGE_MODELS, request);
}
