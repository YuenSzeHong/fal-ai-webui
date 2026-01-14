import { NextResponse } from 'next/server';
import { createModelResponse } from '../model-response-helper';

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
    id: 'fal-ai/lora/image-to-image',
    name: 'LoRA Image-to-Image',
    description: 'General LoRA image-to-image transformation'
  },
  {
    id: 'fal-ai/lora/inpaint',
    name: 'LoRA Inpaint',
    description: 'LoRA inpainting model'
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
    id: 'fal-ai/ideogram/v2/turbo/edit',
    name: 'Ideogram V2 Turbo Edit',
    description: 'Fast Ideogram V2 editing'
  },
  {
    id: 'fal-ai/ideogram/v2/turbo/remix',
    name: 'Ideogram V2 Turbo Remix',
    description: 'Fast Ideogram V2 remixing'
  },
  {
    id: 'fal-ai/flux-general/differential-diffusion',
    name: 'FLUX Differential Diffusion',
    description: 'FLUX differential diffusion editing'
  },
  {
    id: 'fal-ai/flux-differential-diffusion',
    name: 'FLUX Differential Diffusion',
    description: 'Advanced differential diffusion editing'
  },
  {
    id: 'fal-ai/flux-pro/v1/fill-finetuned',
    name: 'FLUX Pro Fill Fine-tuned',
    description: 'Fine-tuned FLUX Pro fill'
  },
  {
    id: 'fal-ai/flux-lora-fill',
    name: 'FLUX LoRA Fill',
    description: 'FLUX LoRA fill and inpainting'
  },
  {
    id: 'fal-ai/flux-pro/v1/canny-finetuned',
    name: 'FLUX Pro Canny Fine-tuned',
    description: 'Fine-tuned FLUX Pro canny control'
  },
  {
    id: 'fal-ai/flux-lora-canny',
    name: 'FLUX LoRA Canny',
    description: 'FLUX LoRA canny edge control'
  },
  {
    id: 'fal-ai/flux-pro/v1/depth-finetuned',
    name: 'FLUX Pro Depth Fine-tuned',
    description: 'Fine-tuned FLUX Pro depth control'
  },
  {
    id: 'fal-ai/flux-lora-depth',
    name: 'FLUX LoRA Depth',
    description: 'FLUX LoRA depth control'
  },
  {
    id: 'fal-ai/flux/schnell/redux',
    name: 'FLUX Schnell Redux',
    description: 'FLUX Schnell with image guidance'
  },
  {
    id: 'fal-ai/flux/dev/redux',
    name: 'FLUX Dev Redux',
    description: 'FLUX Dev with image guidance'
  },
  {
    id: 'fal-ai/flux-pro/v1/redux',
    name: 'FLUX Pro V1 Redux',
    description: 'FLUX Pro V1 with image guidance'
  },
  {
    id: 'fal-ai/flux-pro/v1.1/redux',
    name: 'FLUX Pro V1.1 Redux',
    description: 'FLUX Pro V1.1 with image guidance'
  },
  {
    id: 'fal-ai/flux-pro/v1.1-ultra/redux',
    name: 'FLUX Pro Ultra Redux',
    description: 'FLUX Pro Ultra with image guidance'
  },
  {
    id: 'fal-ai/flux-pulid',
    name: 'FLUX PuLID',
    description: 'FLUX with ID-consistent face generation'
  },
  {
    id: 'fal-ai/kolors/image-to-image',
    name: 'Kolors Image-to-Image',
    description: 'Kolors image transformation'
  },
  {
    id: 'fal-ai/omnigen-v1',
    name: 'OmniGen V1',
    description: 'Multi-modal image editing and generation'
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
  },
  {
    id: 'fal-ai/fooocus/upscale-or-vary',
    name: 'Fooocus Upscale/Vary',
    description: 'Upscale or create variations'
  },
  {
    id: 'fal-ai/fooocus/inpaint',
    name: 'Fooocus Inpaint',
    description: 'Fooocus inpainting'
  },
  {
    id: 'fal-ai/fooocus/image-prompt',
    name: 'Fooocus Image Prompt',
    description: 'Generate with image prompts'
  },
  {
    id: 'fal-ai/layer-diffusion',
    name: 'Layer Diffusion',
    description: 'Generate transparent layers'
  },
  {
    id: 'fal-ai/inpaint',
    name: 'Inpaint',
    description: 'General inpainting model'
  },
  {
    id: 'fal-ai/pulid',
    name: 'PuLID',
    description: 'ID-consistent face generation'
  },
  {
    id: 'fal-ai/omni-zero',
    name: 'Omni-Zero',
    description: 'Zero-shot subject-driven generation'
  },
  {
    id: 'fal-ai/controlnext',
    name: 'ControlNext',
    description: 'Next-generation control for image editing'
  }
];

export async function GET(request: Request) {
  return createModelResponse('image-to-image', IMAGE_TO_IMAGE_MODELS, request);
}
