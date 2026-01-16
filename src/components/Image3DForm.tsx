"use client";

import React, { useState, useEffect } from 'react';
import { 
  DEFAULT_MODELS,
  ModelInfo,
  fetchModels,
  Image3DResult
} from '@/lib/fal-client';
import { taskQueue } from '@/lib/task-queue';
import { useTranslations } from '@/lib/useTranslations';

interface Image3DFormProps {
  onResultChange?: (result: Image3DResult | null) => void;
}

const Image3DForm: React.FC<Image3DFormProps> = ({ onResultChange }) => {
  const { t } = useTranslations();
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODELS.imageTo3D);
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
        const fetchedModels = await fetchModels('image-to-3d');
        setModels(fetchedModels);
      } catch (err) {
        console.error('Failed to load models:', err);
        setModels([{
          id: DEFAULT_MODELS.imageTo3D,
          name: 'Era3D',
          description: 'Image to 3D model generation'
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
      // Add task to queue
      taskQueue.addTask(
        'image-to-3d',
        'Image to 3D conversion',
        selectedModel,
        {
          image_url: imageUrl || imagePreview,
        }
      );
      
      // Reset form
      setImageUrl('');
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start 3D generation');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Model Selection */}
      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('generation.model')}
        </label>
        <select
          id="model"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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

      {/* Image Upload */}
      <div>
        <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('generation.uploadImage')}
        </label>
        <input
          type="file"
          id="imageFile"
          accept="image/*"
          onChange={handleImageFileChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        {imagePreview && (
          <div className="mt-2">
            <img src={imagePreview} alt="Preview" className="max-w-full h-auto rounded-md" style={{ maxHeight: '200px' }} />
          </div>
        )}
      </div>

      {/* Image URL (Alternative) */}
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('generation.imageUrl')} ({t('generation.optional')})
        </label>
        <input
          type="url"
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          disabled={!!imageFile}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Generate Button */}
      <button
        type="submit"
        disabled={isGenerating || (!imageUrl && !imageFile)}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors"
      >
        {isGenerating ? t('generation.generating') : t('generation.generate')}
      </button>
    </form>
  );
};

export default Image3DForm;
