"use client";

import React, { useState, useEffect } from 'react';
import { 
  DEFAULT_MODELS,
  ModelInfo,
  fetchModels,
  ImageGenerationResult,
  generateImageToImage
} from '@/lib/fal-client';
import { taskQueue, Task } from '@/lib/task-queue';
import { addImageToHistory } from '@/lib/history-store';
import { useTranslations } from '@/lib/useTranslations';

interface ImageToImageFormProps {
  onResultChange?: (result: ImageGenerationResult | null) => void;
}

const ImageToImageForm: React.FC<ImageToImageFormProps> = ({ onResultChange }) => {
  const { t } = useTranslations();
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [seed, setSeed] = useState<number | undefined>();
  const [selectedModel, setSelectedModel] = useState('fal-ai/flux-pro/v1.1');
  const [strength, setStrength] = useState(0.8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Model loading state
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  // Fetch available models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setModelsLoading(true);
        const fetchedModels = await fetchModels('image-to-image');
        setModels(fetchedModels);
      } catch (err) {
        console.error('Failed to load models:', err);
        setModels([{
          id: 'fal-ai/flux-pro/v1.1',
          name: 'FLUX Pro 1.1',
          description: 'Default image-to-image model'
        }]);
      } finally {
        setModelsLoading(false);
      }
    };
    loadModels();
  }, []);

  // Handle image file upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageUrl('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl && !imageFile) {
      setError('Please provide an image URL or upload an image file');
      return;
    }
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = imagePreview || '';
      }

      const options = {
        image_url: finalImageUrl,
        seed,
        strength,
      };

      // Add task to queue
      taskQueue.addTask('image', prompt, selectedModel, options);
      
      // Reset form
      setImageFile(null);
      setImagePreview(null);
      setImageUrl('');
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">{t('form.model')}</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={modelsLoading}
        >
          {modelsLoading ? (
            <option>Loading models...</option>
          ) : (
            models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))
          )}
        </select>
        <p className="mt-1 text-sm text-gray-400">
          Includes editing, inpainting, redux, and transformation models
        </p>
      </div>

      {/* Image Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Source Image</label>
        <div className="space-y-3">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setImageFile(null);
              setImagePreview(null);
            }}
            placeholder="Enter image URL"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-center text-sm text-gray-400">or</div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700"
          />
        </div>
        {imagePreview && (
          <div className="mt-3">
            <img src={imagePreview} alt="Preview" className="max-w-full h-auto max-h-64 rounded-lg" />
          </div>
        )}
      </div>

      {/* Prompt */}
      <div>
        <label className="block text-sm font-medium mb-2">{t('form.prompt')}</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe how you want to transform the image"
          rows={3}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Advanced Settings */}
      <details className="border border-gray-700 rounded-lg p-4">
        <summary className="cursor-pointer font-medium">{t('form.advancedSettings')}</summary>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Strength ({strength})
              <span className="text-xs text-gray-400 ml-2">Lower = more like original</span>
            </label>
            <input
              type="range"
              value={strength}
              onChange={(e) => setStrength(parseFloat(e.target.value))}
              min={0.1}
              max={1.0}
              step={0.1}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('form.seed')}</label>
            <input
              type="number"
              value={seed ?? ''}
              onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder={t('form.randomSeed')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </details>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isGenerating || modelsLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        {isGenerating ? t('form.generating') : t('form.generate')}
      </button>
    </form>
  );
};

export default ImageToImageForm;
