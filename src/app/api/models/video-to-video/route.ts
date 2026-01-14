import { NextResponse } from 'next/server';
import { createModelResponse } from '../model-response-helper';

// Video-to-video models available in fal.ai
// Based on https://docs.fal.ai/model-apis
const VIDEO_TO_VIDEO_MODELS = [
  {
    id: 'fal-ai/cogvideox-5b/video-to-video',
    name: 'CogVideoX-5B V2V',
    description: 'CogVideoX 5B video-to-video transformation'
  },
  {
    id: 'fal-ai/fast-animatediff/video-to-video',
    name: 'Fast AnimateDiff V2V',
    description: 'Fast AnimateDiff video-to-video'
  },
  {
    id: 'fal-ai/fast-animatediff/turbo/video-to-video',
    name: 'Fast AnimateDiff Turbo V2V',
    description: 'Turbo AnimateDiff video-to-video'
  }
];

export async function GET(request: Request) {
  return createModelResponse('video-to-video', VIDEO_TO_VIDEO_MODELS, request);
}
