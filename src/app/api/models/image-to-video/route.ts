import { NextResponse } from 'next/server';
import { createModelResponse } from '../model-response-helper';

// Image-to-video models available in fal.ai
// Based on https://docs.fal.ai/model-apis
const IMAGE_TO_VIDEO_MODELS = [
  {
    id: 'fal-ai/minimax/video-01/image-to-video',
    name: 'MiniMax Video-01 I2V',
    description: 'MiniMax image-to-video generation'
  },
  {
    id: 'fal-ai/minimax/video-01-live/image-to-video',
    name: 'MiniMax Video-01 Live I2V',
    description: 'MiniMax live image-to-video generation'
  },
  {
    id: 'fal-ai/kling-video/v1.6/pro/image-to-video',
    name: 'Kling Video v1.6 Pro I2V',
    description: 'Latest Kling Pro model for image-to-video'
  },
  {
    id: 'fal-ai/kling-video/v1.6/standard/image-to-video',
    name: 'Kling Video v1.6 Standard I2V',
    description: 'Latest Kling Standard model for image-to-video'
  },
  {
    id: 'fal-ai/kling-video/v1.5/pro/image-to-video',
    name: 'Kling Video v1.5 Pro I2V',
    description: 'Kling Pro v1.5 image-to-video model'
  },
  {
    id: 'fal-ai/kling-video/v1/pro/image-to-video',
    name: 'Kling Video v1 Pro I2V',
    description: 'Kling Pro v1 image-to-video'
  },
  {
    id: 'fal-ai/kling-video/v1/standard/image-to-video',
    name: 'Kling Video v1 Standard I2V',
    description: 'Kling Standard v1 image-to-video'
  },
  {
    id: 'fal-ai/haiper-video/v2.5/image-to-video/fast',
    name: 'Haiper Video v2.5 Fast I2V',
    description: 'Fast Haiper v2.5 image-to-video generation'
  },
  {
    id: 'fal-ai/haiper-video/v2/image-to-video',
    name: 'Haiper Video v2 I2V',
    description: 'Haiper v2 image-to-video model'
  },
  {
    id: 'fal-ai/luma-dream-machine/image-to-video',
    name: 'Luma Dream Machine I2V',
    description: 'Luma Dream Machine image-to-video'
  },
  {
    id: 'fal-ai/ltx-video/image-to-video',
    name: 'LTX Video I2V',
    description: 'LTX image-to-video model'
  },
  {
    id: 'fal-ai/cogvideox-5b/image-to-video',
    name: 'CogVideoX-5B I2V',
    description: 'CogVideoX 5B image-to-video'
  },

];

export async function GET() {
  return createModelResponse('image-to-video', IMAGE_TO_VIDEO_MODELS);
}
