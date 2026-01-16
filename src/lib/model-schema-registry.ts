import { ModelSchema, COMMON_FIELDS, COMMON_FIELD_GROUPS } from './model-schemas';

// Example schemas for popular models
export const MODEL_SCHEMAS: Record<string, ModelSchema> = {
  'fal-ai/flux-pro/v1.1-ultra': {
    modelId: 'fal-ai/flux-pro/v1.1-ultra',
    name: 'FLUX1.1 [pro] ultra',
    description: 'Ultra quality FLUX Pro model with advanced capabilities',
    category: 'text-to-image',
    fields: [
      COMMON_FIELDS.prompt,
      COMMON_FIELDS.seed,
      COMMON_FIELDS.aspectRatio,
      COMMON_FIELDS.numImages,
      COMMON_FIELDS.outputFormat,
      COMMON_FIELDS.safetyChecker,
      COMMON_FIELDS.safetyTolerance,
      {
        ...COMMON_FIELDS.prompt,
        name: 'raw',
        label: 'Raw Mode',
        type: 'checkbox',
        description: 'Generate less processed, more natural-looking images',
        defaultValue: false,
        group: 'advanced'
      }
    ],
    fieldGroups: COMMON_FIELD_GROUPS
  },

  'fal-ai/minimax/video-01': {
    modelId: 'fal-ai/minimax/video-01',
    name: 'MiniMax Video-01',
    description: 'MiniMax text-to-video generation model',
    category: 'text-to-video',
    fields: [
      COMMON_FIELDS.prompt,
      COMMON_FIELDS.seed,
      COMMON_FIELDS.videoResolution,
      COMMON_FIELDS.videoAspectRatio,
      COMMON_FIELDS.inferenceSteps,
      COMMON_FIELDS.safetyChecker,
      {
        name: 'enable_prompt_expansion',
        label: 'Prompt Expansion',
        type: 'checkbox',
        description: 'Automatically expand and enhance your prompt',
        defaultValue: false,
        group: 'advanced'
      }
    ],
    fieldGroups: COMMON_FIELD_GROUPS
  },

  'fal-ai/minimax/video-01/image-to-video': {
    modelId: 'fal-ai/minimax/video-01/image-to-video',
    name: 'MiniMax Video-01 I2V',
    description: 'Transform images into videos',
    category: 'image-to-video',
    fields: [
      COMMON_FIELDS.imageUrl,
      COMMON_FIELDS.prompt,
      COMMON_FIELDS.seed,
      COMMON_FIELDS.videoResolution,
      COMMON_FIELDS.videoAspectRatio,
      {
        name: 'duration',
        label: 'Duration (seconds)',
        type: 'slider',
        description: 'Video duration in seconds',
        defaultValue: 5,
        min: 3,
        max: 10,
        step: 1,
        group: 'basic'
      }
    ],
    fieldGroups: COMMON_FIELD_GROUPS
  },

  'fal-ai/clarity-upscaler': {
    modelId: 'fal-ai/clarity-upscaler',
    name: 'Clarity Upscaler',
    description: 'High-quality image upscaling with clarity enhancement',
    category: 'upscaling',
    fields: [
      COMMON_FIELDS.imageUrl,
      {
        name: 'scale',
        label: 'Upscale Factor',
        type: 'select',
        description: 'How much to upscale the image',
        defaultValue: 2,
        options: [
          { value: 2, label: '2x' },
          { value: 3, label: '3x' },
          { value: 4, label: '4x' }
        ],
        group: 'basic'
      },
      {
        name: 'creativity',
        label: 'Creativity',
        type: 'slider',
        description: 'Higher values add more creative details',
        defaultValue: 0.5,
        min: 0,
        max: 1,
        step: 0.1,
        group: 'advanced'
      },
      {
        name: 'detail',
        label: 'Detail Level',
        type: 'slider',
        description: 'Control the amount of detail enhancement',
        defaultValue: 0.5,
        min: 0,
        max: 1,
        step: 0.1,
        group: 'advanced'
      }
    ],
    fieldGroups: COMMON_FIELD_GROUPS
  },

  'fal-ai/flux-lora/inpainting': {
    modelId: 'fal-ai/flux-lora/inpainting',
    name: 'FLUX LoRA Inpainting',
    description: 'Edit specific parts of an image using masks',
    category: 'image-to-image',
    fields: [
      COMMON_FIELDS.imageUrl,
      {
        name: 'mask_url',
        label: 'Mask Image',
        type: 'image-upload',
        description: 'Black = keep original, White = edit this area',
        required: true,
        group: 'basic'
      },
      COMMON_FIELDS.prompt,
      COMMON_FIELDS.seed,
      {
        name: 'strength',
        label: 'Strength',
        type: 'slider',
        description: 'How much to change the masked area',
        defaultValue: 0.8,
        min: 0,
        max: 1,
        step: 0.05,
        group: 'advanced'
      },
      COMMON_FIELDS.numImages,
      COMMON_FIELDS.outputFormat
    ],
    fieldGroups: COMMON_FIELD_GROUPS
  },

  'fal-ai/bria/background/remove': {
    modelId: 'fal-ai/bria/background/remove',
    name: 'Bria Background Remove',
    description: 'Remove backgrounds from images automatically',
    category: 'image-utilities',
    fields: [
      COMMON_FIELDS.imageUrl,
      {
        name: 'output_format',
        label: 'Output Format',
        type: 'select',
        description: 'Image format (PNG for transparency)',
        defaultValue: 'png',
        options: [
          { value: 'png', label: 'PNG (with transparency)' },
          { value: 'jpeg', label: 'JPEG (white background)' }
        ],
        group: 'basic'
      }
    ],
    fieldGroups: COMMON_FIELD_GROUPS
  },

  // Example model using custom aspect ratio with dimension calculation
  'fal-ai/flux/dev': {
    modelId: 'fal-ai/flux/dev',
    name: 'FLUX [dev] - Custom Dimensions',
    description: 'FLUX development model with custom aspect ratio support',
    category: 'text-to-image',
    fields: [
      COMMON_FIELDS.prompt,
      COMMON_FIELDS.seed,
      // Use custom aspect ratio instead of dropdown
      COMMON_FIELDS.aspectRatioCustom,
      COMMON_FIELDS.numImages,
      COMMON_FIELDS.outputFormat,
      COMMON_FIELDS.safetyChecker
    ],
    fieldGroups: COMMON_FIELD_GROUPS
  },

  'fal-ai/f5-tts': {
    modelId: 'fal-ai/f5-tts',
    name: 'F5 TTS',
    description: 'High-quality text-to-speech synthesis',
    category: 'audio',
    fields: [
      {
        name: 'text',
        label: 'Text',
        type: 'textarea',
        description: 'Text to convert to speech',
        required: true,
        placeholder: 'Enter text to speak...',
        rows: 4,
        group: 'basic'
      },
      {
        name: 'voice',
        label: 'Voice',
        type: 'select',
        description: 'Select voice model',
        defaultValue: 'default',
        options: [
          { value: 'default', label: 'Default Voice' },
          { value: 'male', label: 'Male Voice' },
          { value: 'female', label: 'Female Voice' }
        ],
        group: 'basic'
      },
      {
        name: 'speed',
        label: 'Speed',
        type: 'slider',
        description: 'Speaking speed (1.0 = normal)',
        defaultValue: 1.0,
        min: 0.5,
        max: 2.0,
        step: 0.1,
        group: 'advanced'
      }
    ],
    fieldGroups: COMMON_FIELD_GROUPS
  }
};

// Function to get schema for a model
export function getModelSchema(modelId: string): ModelSchema | null {
  return MODEL_SCHEMAS[modelId] || null;
}

// Function to check if a model has a custom schema
export function hasModelSchema(modelId: string): boolean {
  return modelId in MODEL_SCHEMAS;
}
