import { NextResponse } from 'next/server';
import { createModelResponse } from '../model-response-helper';
import cache, { CACHE_DURATIONS } from '@/lib/cache';

const CACHE_KEY = 'models:image-utilities';

// Image utility models available in fal.ai (depth, background removal, segmentation, etc.)
// Based on https://docs.fal.ai/model-apis
const IMAGE_UTILITY_MODELS = [
  {
    id: 'fal-ai/imageutils/rembg',
    name: 'Background Removal',
    description: 'Remove backgrounds from images'
  },
  {
    id: 'fal-ai/imageutils/depth',
    name: 'Depth Estimation',
    description: 'Generate depth maps from images'
  },
  {
    id: 'fal-ai/imageutils/marigold-depth',
    name: 'Marigold Depth',
    description: 'High-quality depth estimation'
  },
  {
    id: 'fal-ai/sam2/image',
    name: 'SAM2 Image Segmentation',
    description: 'Segment Anything Model 2 for images'
  },
  {
    id: 'fal-ai/sam2/video',
    name: 'SAM2 Video Segmentation',
    description: 'Segment Anything Model 2 for video'
  },
  {
    id: 'fal-ai/imageutils/sam',
    name: 'SAM Segmentation',
    description: 'Segment Anything Model'
  },
  {
    id: 'fal-ai/dwpose',
    name: 'DWPose',
    description: 'Human pose estimation'
  },
  {
    id: 'fal-ai/auto-caption',
    name: 'Auto Caption',
    description: 'Automatic image captioning'
  },
  {
    id: 'fal-ai/florence-2-large/caption',
    name: 'Florence-2 Caption',
    description: 'Florence-2 image captioning'
  },
  {
    id: 'fal-ai/florence-2-large/detailed-caption',
    name: 'Florence-2 Detailed Caption',
    description: 'Detailed image captioning'
  },
  {
    id: 'fal-ai/florence-2-large/object-detection',
    name: 'Florence-2 Object Detection',
    description: 'Detect objects in images'
  },
  {
    id: 'fal-ai/florence-2-large/ocr',
    name: 'Florence-2 OCR',
    description: 'Optical character recognition'
  },
  {
    id: 'fal-ai/image-preprocessors/depth-anything/v2',
    name: 'Depth Anything V2',
    description: 'Depth estimation preprocessor'
  },
  {
    id: 'fal-ai/image-preprocessors/canny',
    name: 'Canny Edge Detection',
    description: 'Canny edge detection'
  },
  {
    id: 'fal-ai/workflowutils/canny',
    name: 'Workflow Canny',
    description: 'Canny edge for workflows'
  }
];

export async function GET(request: Request) {
  const cachedModels = cache.get<typeof IMAGE_UTILITY_MODELS>(CACHE_KEY);
  if (cachedModels) {
    console.log('[Cache HIT] image-utilities models');
    return createModelResponse('image-utilities', cachedModels, request);
  }
  console.log('[Cache MISS] image-utilities models');
  cache.set(CACHE_KEY, IMAGE_UTILITY_MODELS, CACHE_DURATIONS.MODEL_LIST);
  return createModelResponse('image-utilities', IMAGE_UTILITY_MODELS, request);
}
