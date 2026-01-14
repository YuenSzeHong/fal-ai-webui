/**
 * Fal.ai Models Discovery API Client
 * Fetches available models from https://rest.alpha.fal.ai/models
 * Based on https://docs.fal.ai/platform-apis/v1/models
 */

const FAL_API_BASE = 'https://rest.alpha.fal.ai';

export interface FalModelInfo {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  visibility?: 'public' | 'private';
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface FalModelsListResponse {
  models: FalModelInfo[];
  total?: number;
  next_cursor?: string;
}

/**
 * Fetch all available models from fal.ai Platform API
 * @param apiKey Optional API key for authentication (not required for public models)
 * @returns List of available models
 */
export async function fetchFalModels(apiKey?: string): Promise<FalModelInfo[]> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  // Add API key if provided (for accessing private models or rate limits)
  if (apiKey) {
    headers['Authorization'] = `Key ${apiKey}`;
  }

  try {
    const response = await fetch(`${FAL_API_BASE}/models`, {
      headers,
      cache: 'no-store', // Don't cache at fetch level, use our cache
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }

    const data: FalModelsListResponse = await response.json();
    
    console.log(`[Fal API] Fetched ${data.models?.length || 0} models from fal.ai`);
    
    return data.models || [];
  } catch (error) {
    console.error('[Fal API] Error fetching models from fal.ai:', error);
    throw error;
  }
}

/**
 * Filter models by category/type
 */
export function filterModelsByCategory(models: FalModelInfo[], category: string): FalModelInfo[] {
  const categoryPatterns: Record<string, RegExp[]> = {
    'text-to-image': [
      /text.*to.*image/i,
      /flux/i,
      /sd(xl)?/i,
      /stable.*diffusion/i,
      /lora/i,
      /aura/i,
      /ideogram/i,
      /recraft/i,
      /omnigen/i,
    ],
    'text-to-video': [
      /text.*to.*video/i,
      /minimax.*video/i,
      /kling/i,
      /hunyuan.*video/i,
      /ltx.*video/i,
      /cogvideo/i,
      /mochi/i,
    ],
    'image-to-video': [
      /image.*to.*video/i,
      /i2v/i,
    ],
    'image-to-image': [
      /image.*to.*image/i,
      /inpaint/i,
      /redux/i,
      /fill/i,
      /controlnet/i,
      /img2img/i,
      /style.*transfer/i,
    ],
    'video-to-video': [
      /video.*to.*video/i,
      /v2v/i,
    ],
    'upscaling': [
      /upscal/i,
      /enhance/i,
      /super.*resolution/i,
    ],
    'image-to-3d': [
      /3d/i,
      /mesh/i,
      /rodin/i,
      /era-3d/i,
    ],
    'audio': [
      /audio/i,
      /tts/i,
      /music/i,
      /sound/i,
      /voice/i,
      /lipsync/i,
    ],
    'image-utilities': [
      /rembg/i,
      /depth/i,
      /segment/i,
      /sam/i,
      /background.*remov/i,
      /imageutils/i,
    ],
  };

  const patterns = categoryPatterns[category] || [];
  
  return models.filter(model => {
    const searchText = `${model.id} ${model.name || ''} ${model.description || ''} ${(model.tags || []).join(' ')}`.toLowerCase();
    return patterns.some(pattern => pattern.test(searchText));
  });
}

/**
 * Convert FalModelInfo to our ModelInfo format
 */
export function convertToModelInfo(falModel: FalModelInfo) {
  return {
    id: falModel.id,
    name: falModel.name || formatModelName(falModel.id),
    description: falModel.description || '',
    // Safety filter support - assume FLUX models support it, others don't
    supportsSafetyFilter: falModel.id.includes('flux'),
    safetyFilterNote: falModel.id.includes('flux') 
      ? undefined 
      : 'Safety filter cannot be disabled on this model',
  };
}

/**
 * Format model ID into readable name
 */
function formatModelName(modelId: string): string {
  // Remove fal-ai/ prefix
  const name = modelId.replace(/^fal-ai\//, '');
  
  // Split by / and capitalize each part
  return name
    .split('/')
    .map(part => part
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    )
    .join(' - ');
}
