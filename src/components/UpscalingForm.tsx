"use client";

import React, { useState, useEffect } from 'react';
import { 
  DEFAULT_MODELS,
  ModelInfo,
  fetchModels,
  UpscalingResult,
  upscaleImage
} from '@/lib/fal-client';
import { taskQueue, Task } from '@/lib/task-queue';
import { addImageToHistory } from '@/lib/history-store';
import { useTranslations } from '@/lib/useTranslations';

interface UpscalingFormProps {
  onResultChange?: (result: UpscalingResult | null) => void;
}

const UpscalingForm: React.FC<UpscalingFormProps> = ({ onResultChange }) => {
  const { t } = useTranslations();
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODELS.upscaling);
  const [scale, setScale] = useState(2);
  const [creativity, setCreativity] = useState(0.35);
  const [detail, setDetail] = useState(0.5);
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
        const fetchedModels = await fetchModels('upscaling');
        setModels(fetchedModels);
      } catch (err) {
        console.error('Failed to load models:', err);
        setModels([{
          id: DEFAULT_MODELS.upscaling,
          name: 'Clarity Upscaler',
          description: 'High-quality image upscaling'
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

    setError(null);
    setIsGenerating(true);

    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = imagePreview || '';
      }

      const task: Task = {
        id: Date.now().toString(),
        type: 'image' as const,
        status: 'pending' as const,
        createdAt: new Date(),
        params: {
          prompt: `Upscale ${scale}x`,
          model: selectedModel,
          imageUrl: finalImageUrl,
        },
        execute: async () => {
          const result = await upscaleImage(
            finalImageUrl,
            selectedModel,
            {
              scale,
              creativity,
              detail,
            }
          );

          if (result && result.image) {
            addImageToHistory({
              prompt: `Upscaled ${scale}x`,
              model: selectedModel,
              imageUrl: result.image.url,
              width: result.image.width,
              height: result.image.height,
              timestamp: new Date(),
            });
          }

          if (onResultChange) {
            onResultChange(result);
          }

          return result;
        },
      };

      taskQueue.addTask(task);
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

      {/* Upscaling Settings */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Scale Factor: {scale}x
        </label>
        <input
          type="range"
          value={scale}
          onChange={(e) => setScale(parseInt(e.target.value))}
          min={2}
          max={4}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>2x</span>
          <span>3x</span>
          <span>4x</span>
        </div>
      </div>

      {/* Advanced Settings */}
      <details className="border border-gray-700 rounded-lg p-4">
        <summary className="cursor-pointer font-medium">{t('form.advancedSettings')}</summary>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Creativity ({creativity.toFixed(2)})
              <span className="text-xs text-gray-400 ml-2">Higher = more creative interpretation</span>
            </label>
            <input
              type="range"
              value={creativity}
              onChange={(e) => setCreativity(parseFloat(e.target.value))}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Detail ({detail.toFixed(2)})
              <span className="text-xs text-gray-400 ml-2">Higher = more details</span>
            </label>
            <input
              type="range"
              value={detail}
              onChange={(e) => setDetail(parseFloat(e.target.value))}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
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
        {isGenerating ? t('form.generating') : `Upscale ${scale}x`}
      </button>
    </form>
  );
};

export default UpscalingForm;
