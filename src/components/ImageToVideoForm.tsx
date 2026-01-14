"use client";

import React, { useState, useEffect } from 'react';
import { 
  DEFAULT_MODELS,
  ModelInfo,
  fetchModels,
  VideoGenerationResult,
  VideoResolution,
  VideoAspectRatio,
  generateImageToVideo
} from '@/lib/fal-client';
import { taskQueue, Task } from '@/lib/task-queue';
import { addVideoToHistory } from '@/lib/history-store';
import { useTranslations } from '@/lib/useTranslations';

interface ImageToVideoFormProps {
  onResultChange?: (result: VideoGenerationResult | null) => void;
}

const ImageToVideoForm: React.FC<ImageToVideoFormProps> = ({ onResultChange }) => {
  const { t } = useTranslations();
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [seed, setSeed] = useState<number | undefined>();
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODELS.imageToVideo);
  const [resolution, setResolution] = useState<VideoResolution>('720p');
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('16:9');
  const [duration, setDuration] = useState(5);
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
        const fetchedModels = await fetchModels('image-to-video');
        setModels(fetchedModels);
      } catch (err) {
        console.error('Failed to load models:', err);
        setModels([{
          id: DEFAULT_MODELS.imageToVideo,
          name: 'MiniMax Video-01 Image-to-Video',
          description: 'Default image-to-video model'
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
        setImageUrl(''); // Clear URL if file is uploaded
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
      // Upload image if file was provided
      let finalImageUrl = imageUrl;
      if (imageFile) {
        // In a real implementation, you'd upload to storage
        // For now, we'll use the data URL
        finalImageUrl = imagePreview || '';
      }

      const task: Task = {
        id: Date.now().toString(),
        type: 'video' as const,
        status: 'pending' as const,
        createdAt: new Date(),
        params: {
          prompt,
          model: selectedModel,
          imageUrl: finalImageUrl,
        },
        execute: async () => {
          const result = await generateImageToVideo(
            finalImageUrl,
            prompt,
            selectedModel,
            {
              seed,
              resolution,
              aspect_ratio: aspectRatio,
              duration,
            }
          );

          if (result && result.video) {
            addVideoToHistory({
              prompt,
              model: selectedModel,
              videoUrl: result.video.url,
              seed: result.seed,
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

      {/* Prompt */}
      <div>
        <label className="block text-sm font-medium mb-2">{t('form.prompt')}</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t('form.enterPrompt')}
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
            <label className="block text-sm font-medium mb-2">{t('form.resolution')}</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as VideoResolution)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="480p">480p</option>
              <option value="580p">580p</option>
              <option value="720p">720p</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('form.aspectRatio')}</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as VideoAspectRatio)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="16:9">16:9</option>
              <option value="9:16">9:16</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              min={1}
              max={10}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

export default ImageToVideoForm;
