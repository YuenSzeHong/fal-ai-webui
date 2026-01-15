/**
 * Fal.ai Models Discovery API Client
 * Fetches available models from https://rest.alpha.fal.ai/models
 * Based on https://docs.fal.ai/platform-apis/v1/models
 */

const FAL_API_BASE = 'https://rest.alpha.fal.ai';

export interface FalModelMetadata {
  display_name?: string;
  category?: string;
  description?: string;
  status?: string;
  tags?: string[];
  updated_at?: string;
  is_favorited?: boolean;
  thumbnail_url?: string;
  model_url?: string;
}

export interface FalModelInfo {
  endpoint_id: string;
  metadata?: FalModelMetadata;
  id?: string; // Legacy field
  name?: string; // Legacy field
  description?: string; // Legacy field
  category?: string; // Legacy field
}

export interface FalModelsListResponse {
  list?: FalModelInfo[]; // PRIMARY format per official docs at https://docs.fal.ai/platform-apis/v1/models
  models?: FalModelInfo[]; // Alternative format
  data?: FalModelInfo[]; // Alternative format with pagination
  next_page_cursor?: string | null;
  next_cursor?: string | null;
  has_more?: boolean;
  total?: number;
  limit?: number;
  offset?: number;
}

/**
 * Fetch models from fal.ai Platform API with optional filtering
 * @param options Fetch options including category filter, limit, and API key
 * @returns List of available models
 */
export async function fetchFalModels(options?: {
  category?: string;
  limit?: number;
  apiKey?: string;
  status?: 'active' | 'deprecated';
  fetchAll?: boolean; // Fetch all pages via pagination
}): Promise<FalModelInfo[]> {
  // Skip fetch during build phase
  if (typeof process !== 'undefined' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('[Fal API] Skipping fetch during build phase');
    return [];
  }
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  // Add API key if provided
  if (options?.apiKey) {
    headers['Authorization'] = `Key ${options.apiKey}`;
  }

  const allModels: FalModelInfo[] = [];
  let cursor: string | null = null;
  let pageNumber = 1;

  do {
    // Build query parameters
    const params = new URLSearchParams();
    if (options?.category) {
      params.append('category', options.category);
    }
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options?.status) {
      params.append('status', options.status);
    }
    if (cursor) {
      params.append('cursor', cursor);
    }
    
    const url = `${FAL_API_BASE}/models${params.toString() ? `?${params.toString()}` : ''}`;

    try {
      console.log(`[Fal API] Fetching models page ${pageNumber} from ${url}`);
      
      const response = await fetch(url, {
        headers,
        cache: 'no-store', // Don't cache at fetch level, use our cache
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: FalModelsListResponse = await response.json();
      
      // Handle different response formats per official Context7 docs
      // PRIMARY format is 'list' array per official docs at https://docs.fal.ai/platform-apis/v1/models
      // Alternative formats: 'models' and 'data' (for pagination)
      const models = data.list || data.models || data.data || [];
      
      console.log(`[Fal API] Page ${pageNumber}: fetched ${models.length} models`);
      console.log(`[Fal API] Response format used:`, data.list ? 'list (primary)' : data.models ? 'models' : data.data ? 'data' : 'empty');
      if (pageNumber === 1 && models.length > 0) {
        console.log(`[Fal API] Sample model structure:`, JSON.stringify(models[0], null, 2));
      }
      
      allModels.push(...models);
      
      // Check if there are more pages
      cursor = data.next_page_cursor || data.next_cursor || null;
      const hasMore = data.has_more ?? (cursor !== null);
      
      console.log(`[Fal API] Pagination: has_more=${hasMore}, cursor=${cursor ? 'present' : 'null'}`);
      
      // If not fetching all pages, break after first page
      if (!options?.fetchAll) {
        break;
      }
      
      // If no more pages, stop
      if (!hasMore || !cursor) {
        break;
      }
      
      pageNumber++;
      
      // Safety limit: max 10 pages to prevent infinite loops
      if (pageNumber > 10) {
        console.warn(`[Fal API] Reached maximum page limit (10). Stopping pagination.`);
        break;
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[Fal API] Error fetching models page ${pageNumber}:`, errorMessage);
      
      // If it's the first page, throw the error
      if (pageNumber === 1) {
        throw new Error(`Failed to fetch models from fal.ai: ${errorMessage}`);
      }
      
      // If we already have some models from previous pages, return what we have
      console.warn(`[Fal API] Returning ${allModels.length} models from ${pageNumber - 1} pages`);
      break;
    }
  } while (cursor && options?.fetchAll);
  
  console.log(`[Fal API] Total models fetched: ${allModels.length} from ${pageNumber} page(s)`);
  return allModels;
}

/**
 * Filter models by category/type using pattern matching
 * This is a fallback for when category parameter doesn't work with the API
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
    // Get the model ID and metadata
    const modelId = model.endpoint_id || model.id || '';
    const modelCategory = model.metadata?.category || model.category || '';
    const modelName = model.metadata?.display_name || model.name || '';
    const modelDescription = model.metadata?.description || model.description || '';
    const modelTags = model.metadata?.tags || [];
    
    const searchText = `${modelId} ${modelName} ${modelDescription} ${modelCategory} ${modelTags.join(' ')}`.toLowerCase();
    return patterns.some(pattern => pattern.test(searchText));
  });
}

/**
 * Convert FalModelInfo to our ModelInfo format
 */
export function convertToModelInfo(falModel: FalModelInfo) {
  const modelId = falModel.endpoint_id || falModel.id || '';
  const modelName = falModel.metadata?.display_name || falModel.name || formatModelName(modelId);
  const modelDescription = falModel.metadata?.description || falModel.description || '';
  
  return {
    id: modelId,
    name: modelName,
    description: modelDescription,
    // Safety filter support - assume FLUX models support it, others don't
    supportsSafetyFilter: modelId.toLowerCase().includes('flux'),
    safetyFilterNote: modelId.toLowerCase().includes('flux') 
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
