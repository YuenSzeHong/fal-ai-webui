"use client";

import React from 'react';
import { useTranslations } from '@/lib/useTranslations';

interface SendToFormButtonsProps {
  imageUrl?: string;
  videoUrl?: string;
  onSendToUpscale?: (url: string) => void;
  onSendToI2I?: (url: string) => void;
  onSendToI2V?: (url: string) => void;
  onSendToV2V?: (url: string) => void;
}

const SendToFormButtons: React.FC<SendToFormButtonsProps> = ({
  imageUrl,
  videoUrl,
  onSendToUpscale,
  onSendToI2I,
  onSendToI2V,
  onSendToV2V,
}) => {
  const { t } = useTranslations();

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {imageUrl && (
        <>
          {onSendToUpscale && (
            <button
              onClick={() => onSendToUpscale(imageUrl)}
              className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              title={t('buttons.sendToUpscale')}
            >
              {t('buttons.sendToUpscale')}
            </button>
          )}
          {onSendToI2I && (
            <button
              onClick={() => onSendToI2I(imageUrl)}
              className="px-3 py-1.5 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors"
              title={t('buttons.sendToI2I')}
            >
              {t('buttons.sendToI2I')}
            </button>
          )}
          {onSendToI2V && (
            <button
              onClick={() => onSendToI2V(imageUrl)}
              className="px-3 py-1.5 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded transition-colors"
              title={t('buttons.sendToI2V')}
            >
              {t('buttons.sendToI2V')}
            </button>
          )}
        </>
      )}
      {videoUrl && onSendToV2V && (
        <button
          onClick={() => onSendToV2V(videoUrl)}
          className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
          title={t('buttons.sendToV2V')}
        >
          {t('buttons.sendToV2V')}
        </button>
      )}
    </div>
  );
};

export default SendToFormButtons;
