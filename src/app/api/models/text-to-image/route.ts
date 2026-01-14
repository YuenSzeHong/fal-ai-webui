import { NextResponse } from 'next/server';
import { createModelResponse } from '../model-response-helper';

// Text-to-image models available in fal.ai
// Based on https://docs.fal.ai/model-apis
const TEXT_TO_IMAGE_MODELS = [
  {
    id: 'fal-ai/flux-pro/v1.1-ultra',
    name: 'FLUX1.1 [pro] ultra',
    description: 'Ultra quality FLUX Pro model with advanced capabilities'
  },
  {
    id: 'fal-ai/flux-pro/v1.1',
    name: 'FLUX1.1 [pro]',
    description: 'High quality FLUX Pro model'
  },
  {
    id: 'fal-ai/flux/dev',
    name: 'FLUX [dev]',
    description: 'Development version of FLUX'
  },
  {
    id: 'fal-ai/flux/schnell',
    name: 'FLUX [schnell]',
    description: 'Fast FLUX model for quick generation'
  },
  {
    id: 'fal-ai/flux-lora',
    name: 'FLUX LoRA',
    description: 'FLUX with LoRA fine-tuning support'
  },
  {
    id: 'fal-ai/lora',
    name: 'LoRA',
    description: 'General LoRA model with custom styles'
  },
  {
    id: 'fal-ai/flux-subject',
    name: 'FLUX Subject',
    description: 'FLUX with subject consistency'
  },
  {
    id: 'fal-ai/flux-general',
    name: 'FLUX General',
    description: 'General purpose FLUX model'
  },
  {
    id: 'fal-ai/aura-flow',
    name: 'Aura Flow',
    description: 'Aura Flow text-to-image model'
  },
  {
    id: 'fal-ai/recraft-v3',
    name: 'Recraft V3',
    description: 'Recraft V3 generation model'
  },
  {
    id: 'fal-ai/recraft-20b',
    name: 'Recraft 20B',
    description: 'Recraft 20B parameter model'
  },

  {
    id: 'fal-ai/ideogram/v2',
    name: 'Ideogram V2',
    description: 'Ideogram V2 text-to-image generation'
  },
  {
    id: 'fal-ai/ideogram/v2/turbo',
    name: 'Ideogram V2 Turbo',
    description: 'Fast Ideogram V2 generation'
  },
  {
    id: 'fal-ai/omnigen-v1',
    name: 'OmniGen V1',
    description: 'OmniGen multi-modal generation'
  },
  {
    id: 'fal-ai/sana',
    name: 'Sana',
    description: 'Sana text-to-image model'
  },

  {
    id: 'fal-ai/kolors',
    name: 'Kolors',
    description: 'Kolors text-to-image generation'
  },
  {
    id: 'fal-ai/pixart-sigma',
    name: 'PixArt-Σ',
    description: 'PixArt Sigma high-quality generation'
  },
  {
    id: 'fal-ai/luma-photon',
    name: 'Luma Photon',
    description: 'Luma Photon image generation'
  },
  {
    id: 'fal-ai/luma-photon/flash',
    name: 'Luma Photon Flash',
    description: 'Fast Luma Photon generation'
  }
];

export async function GET() {
  return createModelResponse('text-to-image', TEXT_TO_IMAGE_MODELS);
}
