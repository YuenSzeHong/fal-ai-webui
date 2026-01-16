// Schema types for dynamic form generation
export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'select' 
  | 'checkbox' 
  | 'slider' 
  | 'image-upload'
  | 'file-upload'
  | 'aspect-ratio'; // New type for aspect ratio with dimension calculation

export interface FieldOption {
  value: string | number;
  label: string;
  description?: string;
}

export interface FieldSchema {
  name: string;
  label: string;
  type: FieldType;
  description?: string;
  required?: boolean;
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
  options?: FieldOption[];
  placeholder?: string;
  accept?: string; // For file uploads
  rows?: number; // For textarea
  group?: string; // For grouping fields
  // For aspect-ratio type
  targetSize?: number; // Target size for dimension calculation (default 1024)
  tileSize?: number; // Tile size for rounding (default 8)
  showDimensions?: boolean; // Show calculated dimensions (default true)
}

export interface ModelSchema {
  modelId: string;
  name: string;
  description: string;
  category: string;
  fields: FieldSchema[];
  fieldGroups?: {
    name: string;
    label: string;
    description?: string;
  }[];
}

// Common field schemas that are reused across models
export const COMMON_FIELDS = {
  prompt: {
    name: 'prompt',
    label: 'Prompt',
    type: 'textarea' as FieldType,
    description: 'Describe what you want to generate',
    required: true,
    placeholder: 'Enter your prompt here...',
    rows: 4,
    group: 'basic'
  },
  seed: {
    name: 'seed',
    label: 'Seed',
    type: 'number' as FieldType,
    description: 'Random seed for reproducibility (optional)',
    placeholder: 'Random',
    group: 'advanced'
  },
  numImages: {
    name: 'num_images',
    label: 'Number of Images',
    type: 'select' as FieldType,
    description: 'How many images to generate',
    defaultValue: 1,
    options: [
      { value: 1, label: '1' },
      { value: 2, label: '2' },
      { value: 3, label: '3' },
      { value: 4, label: '4' }
    ],
    group: 'basic'
  },
  aspectRatio: {
    name: 'aspect_ratio',
    label: 'Aspect Ratio',
    type: 'select' as FieldType,
    description: 'Image dimensions',
    defaultValue: '16:9',
    options: [
      { value: '21:9', label: '21:9 - Ultra Wide' },
      { value: '16:9', label: '16:9 - Landscape' },
      { value: '4:3', label: '4:3 - Standard' },
      { value: '3:2', label: '3:2 - Photo' },
      { value: '1:1', label: '1:1 - Square' },
      { value: '2:3', label: '2:3 - Portrait' },
      { value: '3:4', label: '3:4 - Portrait' },
      { value: '9:16', label: '9:16 - Mobile' },
      { value: '9:21', label: '9:21 - Ultra Tall' }
    ],
    group: 'basic'
  },
  aspectRatioCustom: {
    name: 'aspect_ratio',
    label: 'Aspect Ratio',
    type: 'aspect-ratio' as FieldType,
    description: 'Custom aspect ratio (e.g., "16:9") - dimensions will be calculated automatically',
    defaultValue: '16:9',
    placeholder: 'e.g., 16:9',
    targetSize: 1024,
    tileSize: 8,
    showDimensions: true,
    group: 'basic'
  },
  outputFormat: {
    name: 'output_format',
    label: 'Output Format',
    type: 'select' as FieldType,
    description: 'Image file format',
    defaultValue: 'jpeg',
    options: [
      { value: 'jpeg', label: 'JPEG' },
      { value: 'png', label: 'PNG' }
    ],
    group: 'basic'
  },
  safetyChecker: {
    name: 'enable_safety_checker',
    label: 'Enable Safety Checker',
    type: 'checkbox' as FieldType,
    description: 'Filter inappropriate content',
    defaultValue: false,
    group: 'advanced'
  },
  safetyTolerance: {
    name: 'safety_tolerance',
    label: 'Safety Tolerance',
    type: 'slider' as FieldType,
    description: '1 = Most Strict, 6 = Most Permissive',
    defaultValue: 6,
    min: 1,
    max: 6,
    step: 1,
    group: 'advanced'
  },
  imageUrl: {
    name: 'image_url',
    label: 'Image',
    type: 'image-upload' as FieldType,
    description: 'Upload or provide an image URL',
    required: true,
    group: 'basic'
  },
  videoResolution: {
    name: 'resolution',
    label: 'Resolution',
    type: 'select' as FieldType,
    description: 'Video resolution',
    defaultValue: '720p',
    options: [
      { value: '480p', label: '480p' },
      { value: '580p', label: '580p' },
      { value: '720p', label: '720p (HD)' }
    ],
    group: 'basic'
  },
  videoAspectRatio: {
    name: 'aspect_ratio',
    label: 'Aspect Ratio',
    type: 'select' as FieldType,
    description: 'Video aspect ratio',
    defaultValue: '16:9',
    options: [
      { value: '16:9', label: '16:9 - Landscape' },
      { value: '9:16', label: '9:16 - Portrait' }
    ],
    group: 'basic'
  },
  inferenceSteps: {
    name: 'inference_steps',
    label: 'Inference Steps',
    type: 'slider' as FieldType,
    description: 'More steps = higher quality but slower',
    defaultValue: 30,
    min: 10,
    max: 50,
    step: 1,
    group: 'advanced'
  }
};

// Field groups for organizing forms
export const COMMON_FIELD_GROUPS = [
  {
    name: 'basic',
    label: 'Basic Settings',
    description: 'Essential parameters for generation'
  },
  {
    name: 'advanced',
    label: 'Advanced Settings',
    description: 'Optional parameters for fine-tuning'
  }
];
