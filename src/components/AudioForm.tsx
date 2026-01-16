"use client";

import React, { useState, useEffect } from 'react';
import { 
  DEFAULT_MODELS,
  ModelInfo,
  fetchModels,
  AudioResult
} from '@/lib/fal-client';
import { taskQueue } from '@/lib/task-queue';
import { useTranslations } from '@/lib/useTranslations';

interface AudioFormProps {
  onResultChange?: (result: AudioResult | null) => void;
}

const AudioForm: React.FC<AudioFormProps> = ({ onResultChange }) => {
  const { t } = useTranslations();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('fal-ai/stable-audio');
  const [duration, setDuration] = useState(10);
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
        const fetchedModels = await fetchModels('audio');
        setModels(fetchedModels);
        if (fetchedModels.length > 0) {
          setSelectedModel(fetchedModels[0].id);
        }
      } catch (err) {
        console.error('Failed to load models:', err);
        setModels([{
          id: 'fal-ai/stable-audio',
          name: 'Stable Audio',
          description: 'Text to audio generation'
        }]);
      } finally {
        setModelsLoading(false);
      }
    };
    loadModels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      // Add task to queue
      taskQueue.addTask(
        'audio',
        prompt,
        selectedModel,
        {
          duration_seconds: duration,
        }
      );
      
      // Reset form
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start audio generation');
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

      {/* Prompt */}
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('generation.prompt')}
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t('generation.promptPlaceholder')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
        />
      </div>

      {/* Duration */}
      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Duration (seconds): {duration}
        </label>
        <input
          type="range"
          id="duration"
          min="1"
          max="60"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
          className="w-full"
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
        disabled={isGenerating || !prompt.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors"
      >
        {isGenerating ? t('generation.generating') : t('generation.generate')}
      </button>
    </form>
  );
};

export default AudioForm;
