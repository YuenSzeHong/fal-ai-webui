"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  DEFAULT_MODELS,
  ImageGenerationResult, 
  VideoGenerationResult,
  OutputFormat,
  ImageAspectRatio,
  SafetyTolerance,
  VideoResolution,
  VideoAspectRatio
} from '@/lib/fal-client';
import { Task } from '@/lib/task-queue';
import { 
  ImageHistoryItem, 
  VideoHistoryItem,
} from '@/lib/history-store';
import Header from './Header';
import TextToImageForm from './TextToImageForm';
import TextToVideoForm from './TextToVideoForm';
import ImageToVideoForm from './ImageToVideoForm';
import ImageToImageForm from './ImageToImageForm';
import VideoToVideoForm from './VideoToVideoForm';
import UpscalingForm from './UpscalingForm';
import Image3DForm from './Image3DForm';
import AudioForm from './AudioForm';
import ImageUtilitiesForm from './ImageUtilitiesForm';
import HistoryPanel from './HistoryPanel';
import TaskQueuePanel from './TaskQueuePanel';
import CopyToClipboardButton from './common/CopyToClipboardButton';
import UseForGenerationButton from './common/UseForGenerationButton';
import { useTranslations } from '@/lib/useTranslations';
import ImageZoomModal from './common/ImageZoomModal';
import { useModelCounts } from '@/hooks/useModels';

type GenerationType = 
  | 'text-to-image' 
  | 'text-to-video' 
  | 'image-to-video' 
  | 'image-to-image' 
  | 'video-to-video' 
  | 'upscaling' 
  | 'image-to-3d' 
  | 'audio' 
  | 'image-utilities';

// 画像生成フォームの状態の型定義
interface ImageFormState {
  prompt: string;
  seed?: number;
  selectedModel: string;
  numImages: number;
  outputFormat: OutputFormat;
  aspectRatio: ImageAspectRatio;
  enableSafetyChecker: boolean;
  safetyTolerance: SafetyTolerance;
  rawMode: boolean;
}

// 動画生成フォームの状態の型定義
interface VideoFormState {
  prompt: string;
  seed?: number;
  selectedModel: string;
  resolution: VideoResolution;
  aspectRatio: VideoAspectRatio;
  inferenceSteps: number;
  enableSafetyChecker: boolean;
  enablePromptExpansion: boolean;
}

const GenerationPage: React.FC = () => {
  const { t } = useTranslations();
  
  // Common state
  const [generationType, setGenerationType] = useState<GenerationType>('text-to-image');
  const [activePanel, setActivePanel] = useState<'form' | 'history'>('form');
  const [imageResult, setImageResult] = useState<ImageGenerationResult | null>(null);
  const [videoResult, setVideoResult] = useState<VideoGenerationResult | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [formKey, setFormKey] = useState(0); // コンポーネントの強制再マウント用
  
  // Use TanStack Query hook for model counts
  const { data: modelCounts } = useModelCounts();
  
  // フォームの状態を保持するためのステート
  const [imageFormState, setImageFormState] = useState<ImageFormState>({
    prompt: '',
    seed: undefined,
    selectedModel: DEFAULT_MODELS.textToImage,
    numImages: 1,
    outputFormat: 'jpeg',
    aspectRatio: '3:4',
    enableSafetyChecker: false,
    safetyTolerance: '6',
    rawMode: false
  });
  
  const [videoFormState, setVideoFormState] = useState<VideoFormState>({
    prompt: '',
    seed: undefined,
    selectedModel: DEFAULT_MODELS.textToVideo,
    resolution: '720p',
    aspectRatio: '16:9',
    inferenceSteps: 30,
    enableSafetyChecker: false,
    enablePromptExpansion: false
  });
  
  // 画像拡大モーダルの状態
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomedImageUrl, setZoomedImageUrl] = useState('');
  
  // Reset the selected image index when the image result changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [imageResult]);
  
  // タスクを選択して結果を表示
  const handleSelectTask = (task: Task) => {
    if (task.status === 'completed' && task.result) {
      if (task.type === 'image') {
        setImageResult(task.result);
        setGenerationType('text-to-image');
        setSelectedImageIndex(0);
      } else if (task.type === 'video') {
        setVideoResult(task.result);
        setGenerationType('text-to-video');
      }
    }
  };
  
  // 履歴アイテムを選択したときの処理
  const handleSelectHistoryItem = (item: ImageHistoryItem | VideoHistoryItem) => {
    if (item.type === 'image') {
      setImageResult(item.result);
      setGenerationType('text-to-image');
      setSelectedImageIndex(0);
    } else if (item.type === 'video') {
      setVideoResult(item.result);
      setGenerationType('text-to-video');
    }
    setActivePanel('form');
  };

  // 結果表示コンポーネント
  const ResultDisplay = () => {
    // Show image results for image-related generation types
    const imageTypes: GenerationType[] = ['text-to-image', 'image-to-image', 'upscaling', 'image-utilities'];
    const videoTypes: GenerationType[] = ['text-to-video', 'image-to-video', 'video-to-video'];
    
    if (imageTypes.includes(generationType)) {
      if (imageResult && imageResult.images && imageResult.images.length > 0) {
        return (
          <div>
            <div 
              className="relative aspect-square w-full mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-zoom-in"
              onClick={() => {
                setZoomedImageUrl(imageResult.images[selectedImageIndex].url);
                setIsZoomModalOpen(true);
              }}
            >
              <Image
                src={imageResult.images[selectedImageIndex].url}
                alt={`Generated image ${selectedImageIndex + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
            
            {/* Image Gallery for Multiple Images */}
            {imageResult.images.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {imageResult.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`relative w-16 h-16 cursor-pointer rounded-md overflow-hidden border-2 ${
                      selectedImageIndex === index 
                        ? 'border-primary-500 dark:border-primary-400' 
                        : 'border-transparent'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>{t('generation.result.seed')}: {imageResult.seed || t('generation.result.random')}</p>
              <p>{t('generation.result.resolution')}: {imageResult.images[selectedImageIndex].width}x{imageResult.images[selectedImageIndex].height}</p>
              <div className="mt-2">
                <p className="font-medium">{t('generation.result.prompt')}:</p>
                <div className="relative">
                  <p className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded-md max-h-24 overflow-y-auto whitespace-pre-wrap">
                    {imageResult.prompt || t('generation.result.noPromptData')}
                  </p>
                  <div className="flex mt-2 gap-2">
                    <CopyToClipboardButton
                      text={imageResult.prompt || ''}
                      className="text-xs flex items-center px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                      buttonText={t('buttons.copy')}
                    />
                    <UseForGenerationButton
                      prompt={imageResult.prompt || ''}
                      onClick={usePromptForGeneration}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <a
                href={imageResult.images[selectedImageIndex].url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-full"
              >
                {t('buttons.downloadImage')}
              </a>
            </div>
          </div>
        );
      } else {
        return (
          <div className="flex justify-center items-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">{t('generation.result.willAppearHere')}</p>
          </div>
        );
      }
    } else {
      if (videoResult && videoResult.video && videoResult.video.url) {
        return (
          <div>
            <div className="aspect-video w-full mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              <video
                src={videoResult.video.url}
                controls
                autoPlay
                loop
                muted
                className="w-full h-full"
              />
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>{t('generation.result.seed')}: {videoResult.seed || t('generation.result.random')}</p>
              <div className="mt-2">
                <p className="font-medium">{t('generation.result.prompt')}:</p>
                <div className="relative">
                  <p className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded-md max-h-24 overflow-y-auto whitespace-pre-wrap">
                    {videoResult.prompt || t('generation.result.noPromptData')}
                  </p>
                  <div className="flex mt-2 gap-2">
                    <CopyToClipboardButton
                      text={videoResult.prompt || ''}
                      className="text-xs flex items-center px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                      buttonText={t('buttons.copy')}
                    />
                    <UseForGenerationButton
                      prompt={videoResult.prompt || ''}
                      onClick={usePromptForGeneration}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <a
                href={videoResult.video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-full"
                download
              >
                {t('buttons.downloadVideo')}
              </a>
            </div>
          </div>
        );
      } else {
        return (
          <div className="flex justify-center items-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">{t('generation.result.willAppearHere')}</p>
          </div>
        );
      }
    }
  };

  // プロンプトを生成フォームに適用する関数
  const usePromptForGeneration = (prompt: string) => {
    // Image-related types
    const imageTypes: GenerationType[] = ['text-to-image', 'image-to-image', 'upscaling', 'image-utilities'];
    const videoTypes: GenerationType[] = ['text-to-video', 'image-to-video', 'video-to-video'];
    
    if (imageTypes.includes(generationType)) {
      // 現在の状態を保存
      localStorage.setItem('savedImagePrompt', prompt);
      // イメージフォームの状態を更新
      setImageFormState(prev => ({
        ...prev,
        prompt
      }));
    } else if (videoTypes.includes(generationType)) {
      localStorage.setItem('savedVideoPrompt', prompt);
      // ビデオフォームの状態を更新
      setVideoFormState(prev => ({
        ...prev,
        prompt
      }));
    }
    
    // フォームを強制的に再マウントするためにキーを更新
    setFormKey(prevKey => prevKey + 1);
    
    // アクティブパネルをフォームに切り替える
    setActivePanel('form');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        
        {/* メインナビゲーション - 改善版 */}
        <div className="mb-6">
          {/* メインタブナビゲーション - より大きく、明確に */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-4">
            <button
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                activePanel === 'form'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-750'
              }`}
              onClick={() => setActivePanel('form')}
            >
              <span className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {t('navigation.newGeneration')}
              </span>
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                activePanel === 'history'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-750'
              }`}
              onClick={() => setActivePanel('history')}
            >
              <span className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('navigation.history')}
              </span>
            </button>
          </div>
          
          {/* サブナビゲーション - 生成タイプの選択 (フォームパネルのみ表示) */}
          {activePanel === 'form' && (
            <div className="border-b border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
              <div className="flex min-w-max">
                {/* Text to Image */}
                <button
                  className={`relative py-3 px-4 font-medium text-xs sm:text-sm focus:outline-none whitespace-nowrap ${
                    generationType === 'text-to-image'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setGenerationType('text-to-image')}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {t('categories.t2i')}
                  </span>
                  {generationType === 'text-to-image' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                  )}
                </button>
                
                {/* Text to Video */}
                <button
                  className={`relative py-3 px-4 font-medium text-xs sm:text-sm focus:outline-none whitespace-nowrap ${
                    generationType === 'text-to-video'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setGenerationType('text-to-video')}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {t('categories.t2v')}
                  </span>
                  {generationType === 'text-to-video' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                  )}
                </button>
                
                {/* Image to Video */}
                <button
                  className={`relative py-3 px-4 font-medium text-xs sm:text-sm focus:outline-none whitespace-nowrap ${
                    generationType === 'image-to-video'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setGenerationType('image-to-video')}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                    {t('categories.i2v')}
                  </span>
                  {generationType === 'image-to-video' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                  )}
                </button>
                
                {/* Image to Image */}
                <button
                  className={`relative py-3 px-4 font-medium text-xs sm:text-sm focus:outline-none whitespace-nowrap ${
                    generationType === 'image-to-image'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setGenerationType('image-to-image')}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {t('categories.i2i')}
                  </span>
                  {generationType === 'image-to-image' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                  )}
                </button>
                
                {/* Video to Video */}
                <button
                  className={`relative py-3 px-4 font-medium text-xs sm:text-sm focus:outline-none whitespace-nowrap ${
                    generationType === 'video-to-video'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setGenerationType('video-to-video')}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                    {t('categories.v2v')}
                  </span>
                  {generationType === 'video-to-video' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                  )}
                </button>
                
                {/* Upscaling */}
                <button
                  className={`relative py-3 px-4 font-medium text-xs sm:text-sm focus:outline-none whitespace-nowrap ${
                    generationType === 'upscaling'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setGenerationType('upscaling')}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    {t('categories.upscale')}
                  </span>
                  {generationType === 'upscaling' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                  )}
                </button>
                
                {/* Image to 3D */}
                <button
                  className={`relative py-3 px-4 font-medium text-xs sm:text-sm focus:outline-none whitespace-nowrap ${
                    generationType === 'image-to-3d'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setGenerationType('image-to-3d')}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    {t('categories.i23d')}
                  </span>
                  {generationType === 'image-to-3d' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                  )}
                </button>
                
                {/* Audio */}
                <button
                  className={`relative py-3 px-4 font-medium text-xs sm:text-sm focus:outline-none whitespace-nowrap ${
                    generationType === 'audio'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setGenerationType('audio')}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    {t('categories.audio')}
                  </span>
                  {generationType === 'audio' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                  )}
                </button>
                
                {/* Image Utilities */}
                <button
                  className={`relative py-3 px-4 font-medium text-xs sm:text-sm focus:outline-none whitespace-nowrap ${
                    generationType === 'image-utilities'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setGenerationType('image-utilities')}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t('categories.utils')}
                  </span>
                  {generationType === 'image-utilities' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* アクティブなパネルを表示 */}
        {activePanel === 'form' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* 左側カラム: フォーム部分 */}
            <div className="xl:col-span-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                {generationType === 'text-to-image' ? (
                  <TextToImageForm 
                    onResultChange={setImageResult}
                    key={formKey}
                    initialState={imageFormState}
                    onStateChange={setImageFormState}
                  />
                ) : generationType === 'text-to-video' ? (
                  <TextToVideoForm 
                    onResultChange={setVideoResult}
                    key={formKey}
                    initialState={videoFormState}
                    onStateChange={setVideoFormState}
                  />
                ) : generationType === 'image-to-video' ? (
                  <ImageToVideoForm 
                    onResultChange={setVideoResult}
                    key={formKey}
                  />
                ) : generationType === 'image-to-image' ? (
                  <ImageToImageForm 
                    onResultChange={setImageResult}
                    key={formKey}
                  />
                ) : generationType === 'video-to-video' ? (
                  <VideoToVideoForm 
                    onResultChange={setVideoResult}
                    key={formKey}
                  />
                ) : generationType === 'upscaling' ? (
                  <UpscalingForm 
                    onResultChange={(result) => {
                      if (result) {
                        // Convert UpscalingResult to ImageGenerationResult format
                        setImageResult({
                          images: [result.image],
                          prompt: 'Upscaled image',
                          seed: undefined
                        });
                      } else {
                        setImageResult(null);
                      }
                    }}
                    key={formKey}
                  />
                ) : generationType === 'image-to-3d' ? (
                  <Image3DForm 
                    onResultChange={() => {}}
                    key={formKey}
                  />
                ) : generationType === 'audio' ? (
                  <AudioForm 
                    onResultChange={() => {}}
                    key={formKey}
                  />
                ) : generationType === 'image-utilities' ? (
                  <ImageUtilitiesForm 
                    onResultChange={setImageResult}
                    key={formKey}
                  />
                ) : null}
              </div>
              
              {/* タスクキュー部分を左側カラムの下に配置 - スマホでも表示されるように */}
              <div className="xl:hidden">
                <TaskQueuePanel onTaskSelected={handleSelectTask} />
              </div>
            </div>
            
            {/* 中央カラム: 結果表示エリア */}
            <div className="xl:col-span-5">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  {generationType.includes('image') || generationType === 'upscaling' || generationType === 'image-utilities' 
                    ? t('generation.result.imageTitle') 
                    : generationType.includes('video') 
                    ? t('generation.result.videoTitle')
                    : 'Result'}
                </h2>
                <ResultDisplay />
              </div>
            </div>
            
            {/* 右側カラム: タスクキュー部分 - デスクトップでのみ表示 */}
            <div className="hidden xl:block xl:col-span-3">
              <TaskQueuePanel onTaskSelected={handleSelectTask} />
            </div>
          </div>
        ) : (
          <HistoryPanel 
            type="all" 
            onSelectHistoryItem={handleSelectHistoryItem} 
            onUsePrompt={usePromptForGeneration}
          />
        )}
      </div>

      {/* 画像拡大モーダル */}
      <ImageZoomModal 
        isOpen={isZoomModalOpen}
        onClose={() => setIsZoomModalOpen(false)}
        imageUrl={zoomedImageUrl}
      />
    </div>
  );
};

export default GenerationPage; 