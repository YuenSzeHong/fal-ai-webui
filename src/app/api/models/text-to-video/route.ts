import { NextResponse } from 'next/server';

// Text-to-video models available in fal.ai
// Based on https://docs.fal.ai/model-apis
const TEXT_TO_VIDEO_MODELS = [
  {
    id: 'fal-ai/minimax/video-01',
    name: 'MiniMax Video-01',
    description: 'MiniMax text-to-video generation model'
  },
  {
    id: 'fal-ai/minimax/video-01-live',
    name: 'MiniMax Video-01 Live',
    description: 'Live MiniMax text-to-video generation'
  },
  {
    id: 'fal-ai/kling-video/v1.6/pro/text-to-video',
    name: 'Kling Video v1.6 Pro',
    description: 'Latest Kling Pro model for high-quality video generation'
  },
  {
    id: 'fal-ai/kling-video/v1.6/standard/text-to-video',
    name: 'Kling Video v1.6 Standard',
    description: 'Latest Kling Standard model for text-to-video'
  },
  {
    id: 'fal-ai/kling-video/v1.5/pro/text-to-video',
    name: 'Kling Video v1.5 Pro',
    description: 'Kling Pro v1.5 text-to-video model'
  },
  {
    id: 'fal-ai/kling-video/v1/pro/text-to-video',
    name: 'Kling Video v1 Pro',
    description: 'Kling Pro v1 text-to-video model'
  },
  {
    id: 'fal-ai/kling-video/v1/standard/text-to-video',
    name: 'Kling Video v1 Standard',
    description: 'Kling Standard v1 text-to-video model'
  },
  {
    id: 'fal-ai/hunyuan-video',
    name: 'Hunyuan Video',
    description: 'Hunyuan text-to-video generation'
  },
  {
    id: 'fal-ai/mochi-v1',
    name: 'Mochi V1',
    description: 'Mochi text-to-video model'
  },
  {
    id: 'fal-ai/ltx-video',
    name: 'LTX Video',
    description: 'LTX text-to-video model'
  },
  {
    id: 'fal-ai/cogvideox-5b',
    name: 'CogVideoX-5B',
    description: 'CogVideoX 5B parameter model'
  },
  {
    id: 'fal-ai/haiper-video/v2',
    name: 'Haiper Video V2',
    description: 'Haiper V2 text-to-video'
  },
  {
    id: 'fal-ai/haiper-video/v2.5/fast',
    name: 'Haiper Video V2.5 Fast',
    description: 'Fast Haiper V2.5 text-to-video'
  },
  {
    id: 'fal-ai/luma-dream-machine',
    name: 'Luma Dream Machine',
    description: 'Luma Dream Machine text-to-video'
  },
  {
    id: 'fal-ai/fast-svd/text-to-video',
    name: 'Fast SVD',
    description: 'Fast Stable Video Diffusion for text-to-video'
  },
  {
    id: 'fal-ai/fast-animatediff/text-to-video',
    name: 'Fast AnimateDiff',
    description: 'Fast AnimateDiff text-to-video generation'
  },
  {
    id: 'fal-ai/fast-animatediff/turbo/text-to-video',
    name: 'Fast AnimateDiff Turbo',
    description: 'Turbo AnimateDiff text-to-video'
  }
];

export async function GET() {
  return NextResponse.json({ models: TEXT_TO_VIDEO_MODELS });
}
