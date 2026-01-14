"use client";

import React, { useState, useEffect } from 'react';
import { ModelSchema } from '@/lib/model-schemas';
import DynamicFormField from './DynamicFormField';
import { useTranslations } from '@/lib/useTranslations';

interface DynamicGenerationFormProps {
  schema: ModelSchema;
  onSubmit: (values: Record<string, any>) => void;
  isGenerating?: boolean;
  error?: string | null;
}

const DynamicGenerationForm: React.FC<DynamicGenerationFormProps> = ({
  schema,
  onSubmit,
  isGenerating = false,
  error = null
}) => {
  const { t } = useTranslations();
  const [values, setValues] = useState<Record<string, any>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['basic']));

  // Initialize form values with defaults
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    schema.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initialValues[field.name] = field.defaultValue;
      }
    });
    setValues(initialValues);
  }, [schema]);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const missingFields = schema.fields
      .filter((field) => field.required && !values[field.name])
      .map((field) => field.label);
    
    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Filter out undefined values
    const cleanedValues = Object.entries(values).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    onSubmit(cleanedValues);
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  // Group fields by group name
  const fieldsByGroup = schema.fields.reduce((acc, field) => {
    const group = field.group || 'basic';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(field);
    return acc;
  }, {} as Record<string, typeof schema.fields>);

  const groupMetadata = schema.fieldGroups || [
    { name: 'basic', label: 'Basic Settings' },
    { name: 'advanced', label: 'Advanced Settings' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Model Info */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {schema.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {schema.description}
        </p>
      </div>

      {/* Grouped Fields */}
      {groupMetadata.map((groupMeta) => {
        const groupFields = fieldsByGroup[groupMeta.name] || [];
        if (groupFields.length === 0) return null;

        const isExpanded = expandedGroups.has(groupMeta.name);

        return (
          <div key={groupMeta.name} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleGroup(groupMeta.name)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 flex items-center justify-between text-left"
            >
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {groupMeta.label}
                </h4>
                {groupMeta.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {groupMeta.description}
                  </p>
                )}
              </div>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="p-4 bg-white dark:bg-gray-900">
                {groupFields.map((field) => (
                  <DynamicFormField
                    key={field.name}
                    field={field}
                    value={values[field.name]}
                    onChange={handleChange}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isGenerating}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('form.generating')}
          </>
        ) : (
          t('form.generate')
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        </div>
      )}
    </form>
  );
};

export default DynamicGenerationForm;
