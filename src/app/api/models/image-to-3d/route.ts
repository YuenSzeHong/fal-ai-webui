import { NextResponse } from 'next/server';
import { createModelResponse } from '../model-response-helper';

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

export async function GET() {
  return createModelResponse('image-to-3d', IMAGE_TO_3D_MODELS);
}
