import { NextResponse } from 'next/server';
import { createModelResponse } from '../model-response-helper';

// Audio generation models available in fal.ai
// Based on https://docs.fal.ai/model-apis
const AUDIO_MODELS = [

  {
    id: 'fal-ai/minimax-music',
    name: 'MiniMax Music',
    description: 'Music generation with MiniMax'
  },
  {
    id: 'fal-ai/f5-tts',
    name: 'F5 TTS',
    description: 'F5 text-to-speech synthesis'
  },
  {
    id: 'fal-ai/playai/tts/v3',
    name: 'PlayAI TTS V3',
    description: 'PlayAI text-to-speech V3'
  },
  {
    id: 'fal-ai/playai/tts/dialog',
    name: 'PlayAI TTS Dialog',
    description: 'PlayAI dialog text-to-speech'
  },
  {
    id: 'fal-ai/mmaudio-v2',
    name: 'MMAudio V2',
    description: 'Multi-modal audio generation V2'
  },
  {
    id: 'fal-ai/mmaudio-v2/text-to-audio',
    name: 'MMAudio V2 Text-to-Audio',
    description: 'MMAudio V2 text-to-audio generation'
  },
  {
    id: 'fal-ai/sync-lipsync',
    name: 'Sync Lipsync',
    description: 'Lip-sync audio to video'
  },
  {
    id: 'fal-ai/dubbing',
    name: 'Dubbing',
    description: 'Video dubbing service'
  },
  {
    id: 'fal-ai/latentsync',
    name: 'LatentSync',
    description: 'Audio-driven facial animation'
  }
];

export async function GET() {
  return createModelResponse('audio', AUDIO_MODELS);
}
