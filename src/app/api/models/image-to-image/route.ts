import { NextResponse } from 'next/server';

// Image-to-image models available in fal.ai (editing, inpainting, style transfer, etc.)
// Based on https://docs.fal.ai/model-apis
const IMAGE_TO_IMAGE_MODELS = [
  {
    id: 'fal-ai/flux/dev/image-to-image',
    name: 'FLUX Dev Image-to-Image',
    description: 'FLUX development image-to-image transformation'
  },
  {
    id: 'fal-ai/flux-lora/image-to-image',
    name: 'FLUX LoRA Image-to-Image',
    description: 'FLUX LoRA image-to-image with fine-tuning'
  },
  {
    id: 'fal-ai/flux-lora/inpainting',
    name: 'FLUX LoRA Inpainting',
    description: 'FLUX LoRA inpainting and editing'
  },
  {
    id: 'fal-ai/flux-general/image-to-image',
    name: 'FLUX General Image-to-Image',
    description: 'General purpose FLUX image transformation'
  },
  {
    id: 'fal-ai/flux-general/inpainting',
    name: 'FLUX General Inpainting',
    description: 'FLUX general inpainting'
  },
  {
    id: 'fal-ai/flux-pro/v1/fill',
    name: 'FLUX Pro Fill',
    description: 'FLUX Pro inpainting and fill'
  },
  {
    id: 'fal-ai/flux-pro/v1/canny',
    name: 'FLUX Pro Canny',
    description: 'FLUX Pro with canny edge control'
  },
  {
    id: 'fal-ai/flux-pro/v1/depth',
    name: 'FLUX Pro Depth',
    description: 'FLUX Pro with depth control'
  },
  {
    id: 'fal-ai/ideogram/v2/edit',
    name: 'Ideogram V2 Edit',
    description: 'Ideogram V2 image editing'
  },
  {
    id: 'fal-ai/ideogram/v2/remix',
    name: 'Ideogram V2 Remix',
    description: 'Ideogram V2 image remixing'
  },
  {
    id: 'fal-ai/stable-diffusion-v3-medium/image-to-image',
    name: 'SD3 Medium Image-to-Image',
    description: 'Stable Diffusion 3 image transformation'
  },
  {
    id: 'fal-ai/kolors/image-to-image',
    name: 'Kolors Image-to-Image',
    description: 'Kolors image transformation'
  },
  {
    id: 'fal-ai/fast-sdxl/image-to-image',
    name: 'Fast SDXL Image-to-Image',
    description: 'Fast SDXL image transformation'
  },
  {
    id: 'fal-ai/fast-sdxl/inpainting',
    name: 'Fast SDXL Inpainting',
    description: 'Fast SDXL inpainting'
  },
  {
    id: 'fal-ai/bria/eraser',
    name: 'Bria Eraser',
    description: 'Remove objects from images'
  },
  {
    id: 'fal-ai/bria/background/replace',
    name: 'Bria Background Replace',
    description: 'Replace image backgrounds'
  },
  {
    id: 'fal-ai/bria/background/remove',
    name: 'Bria Background Remove',
    description: 'Remove image backgrounds'
  },
  {
    id: 'fal-ai/bria/genfill',
    name: 'Bria GenFill',
    description: 'Generative fill for images'
  },
  {
    id: 'fal-ai/bria/expand',
    name: 'Bria Expand',
    description: 'Expand image boundaries'
  },
  {
    id: 'fal-ai/iclight-v2',
    name: 'IC-Light V2',
    description: 'Relighting for images'
  },
  {
    id: 'fal-ai/retoucher',
    name: 'Retoucher',
    description: 'Automatic portrait retouching'
  },
  {
    id: 'fal-ai/face-to-sticker',
    name: 'Face to Sticker',
    description: 'Convert faces to stickers'
  }
];

export async function GET() {
  return NextResponse.json({ models: IMAGE_TO_IMAGE_MODELS });
}
