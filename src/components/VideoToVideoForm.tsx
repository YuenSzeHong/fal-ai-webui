"use client";

import React, { useState, useEffect } from 'react';
import { 
  ModelInfo,
  fetchModels,
  VideoGenerationResult,
  generateVideoToVideo
} from '@/lib/fal-client';
import { taskQueue, Task } from '@/lib/task-queue';
import { addVideoToHistory } from '@/lib/history-store';
import { useTranslations } from '@/lib/useTranslations';

interface VideoToVideoFormProps {
  onResultChange?: (result: VideoGenerationResult | null) => void;
}

const VideoToVideoForm: React.FC<VideoToVideoFormProps> = ({ onResultChange }) => {
  const { t } = useTranslations();
  const [videoUrl, setVideoUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [seed, setSeed] = useState<number | undefined>();
  const [selectedModel, setSelectedModel] = useState('fal-ai/fast-animatediff/text-to-video');
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
        const fetchedModels = await fetchModels('video-to-video');
        setModels(fetchedModels);
      } catch (err) {
        console.error('Failed to load models:', err);
        setModels([{
          id: 'fal-ai/fast-animatediff/text-to-video',
          name: 'Fast AnimateDiff',
          description: 'Video transformation model'
        }]);
      } finally {
        setModelsLoading(false);
      }
    };
    loadModels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoUrl.trim()) {
      setError('Please provide a video URL');
      return;
    }
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const options = {
        video_url: videoUrl,
        seed,
      };

      // Add task to queue
      taskQueue.addTask('video', prompt, selectedModel, options);
      
      // Reset form
      setVideoUrl('');
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
      </div>

      {/* Video URL Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Source Video URL</label>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Enter video URL"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Prompt */}
      <div>
        <label className="block text-sm font-medium mb-2">{t('form.prompt')}</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe how you want to transform the video"
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

export default VideoToVideoForm;
