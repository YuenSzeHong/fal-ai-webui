"use client";

import React, { useState, useEffect } from 'react';
import { FieldSchema, FieldType } from '@/lib/model-schemas';
import { useTranslations } from '@/lib/useTranslations';
import { 
  calculateBestDimensions, 
  validateAspectRatio, 
  ASPECT_RATIO_PRESETS 
} from '@/lib/aspect-ratio-utils';

interface DynamicFormFieldProps {
  field: FieldSchema;
  value: any;
  onChange: (name: string, value: any) => void;
}

const DynamicFormField: React.FC<DynamicFormFieldProps> = ({ field, value, onChange }) => {
  const { t } = useTranslations();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aspectRatioError, setAspectRatioError] = useState<string | null>(null);
  const [calculatedDimensions, setCalculatedDimensions] = useState<{ width: number; height: number } | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage (would need implementation)
    // For now, just use a data URL
    onChange(field.name, reader.result);
  };

  // Calculate dimensions when aspect ratio changes
  useEffect(() => {
    if (field.type === 'aspect-ratio' && value) {
      if (validateAspectRatio(value)) {
        try {
          const dimensions = calculateBestDimensions(
            value,
            field.targetSize || 1024,
            field.tileSize || 8
          );
          setCalculatedDimensions(dimensions);
          setAspectRatioError(null);
        } catch (error) {
          setAspectRatioError('Invalid aspect ratio');
          setCalculatedDimensions(null);
        }
      } else {
        setAspectRatioError('Use format like "16:9"');
        setCalculatedDimensions(null);
      }
    }
  }, [value, field.type, field.targetSize, field.tileSize]);

  const renderField = () => {
    switch (field.type) {
      case 'aspect-ratio':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                id={field.name}
                className={`input bg-white dark:bg-gray-700 dark:text-white flex-1 ${
                  aspectRatioError ? 'border-red-500' : ''
                }`}
                value={value || ''}
                onChange={(e) => onChange(field.name, e.target.value)}
                placeholder={field.placeholder || 'e.g., 16:9'}
                required={field.required}
              />
              {/* Preset dropdown */}
              <select
                className="input bg-white dark:bg-gray-700 dark:text-white w-48"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    onChange(field.name, e.target.value);
                  }
                }}
              >
                <option value="">Presets...</option>
                {ASPECT_RATIO_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
            {aspectRatioError && (
              <p className="text-sm text-red-500">{aspectRatioError}</p>
            )}
            {field.showDimensions !== false && calculatedDimensions && (
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  Calculated dimensions: {calculatedDimensions.width} × {calculatedDimensions.height}px
                </span>
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            id={field.name}
            className="input bg-white dark:bg-gray-700 dark:text-white"
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field.name}
            className="input bg-white dark:bg-gray-700 dark:text-white"
            rows={field.rows || 4}
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            id={field.name}
            className="input bg-white dark:bg-gray-700 dark:text-white"
            value={value || ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange(field.name, val ? parseInt(val, 10) : undefined);
            }}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            id={field.name}
            className="input bg-white dark:bg-gray-700 dark:text-white"
            value={value !== undefined ? value : field.defaultValue}
            onChange={(e) => {
              const val = e.target.value;
              // Try to parse as number if it's a numeric string
              const parsedVal = !isNaN(Number(val)) ? Number(val) : val;
              onChange(field.name, parsedVal);
            }}
            required={field.required}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.name}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={value !== undefined ? value : field.defaultValue}
              onChange={(e) => onChange(field.name, e.target.checked)}
            />
            <label htmlFor={field.name} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              {field.label}
            </label>
          </div>
        );

      case 'slider':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="range"
              id={field.name}
              min={field.min}
              max={field.max}
              step={field.step}
              value={value !== undefined ? value : field.defaultValue}
              onChange={(e) => onChange(field.name, Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[2.5rem] text-center">
              {value !== undefined ? value : field.defaultValue}
            </span>
          </div>
        );

      case 'image-upload':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="file"
                id={field.name}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor={field.name}
                className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Upload Image
              </label>
              <input
                type="text"
                placeholder="Or paste image URL"
                className="input bg-white dark:bg-gray-700 dark:text-white flex-1"
                value={typeof value === 'string' && value.startsWith('http') ? value : ''}
                onChange={(e) => {
                  onChange(field.name, e.target.value);
                  setImagePreview(e.target.value);
                }}
              />
            </div>
            {imagePreview && (
              <div className="mt-2 relative w-full h-48 border rounded overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        );

      default:
        return <input type="text" className="input" value={value || ''} onChange={(e) => onChange(field.name, e.target.value)} />;
    }
  };

  // For checkbox, the label is rendered within the field
  if (field.type === 'checkbox') {
    return (
      <div className="mb-4">
        {renderField()}
        {field.description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {field.description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {field.description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {field.description}
        </p>
      )}
    </div>
  );
};

export default DynamicFormField;
