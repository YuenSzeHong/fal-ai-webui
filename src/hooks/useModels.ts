import { useQuery } from '@tanstack/react-query';

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  supportsSafetyFilter?: boolean;
  safetyFilterNote?: string;
}

type ModelCategory = 
  | 'text-to-image' 
  | 'text-to-video' 
  | 'image-to-video' 
  | 'image-to-image' 
  | 'video-to-video' 
  | 'upscaling' 
  | 'image-to-3d' 
  | 'audio' 
  | 'image-utilities';

async function fetchModels(category: ModelCategory): Promise<ModelInfo[]> {
  const response = await fetch(`/api/models/${category}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to fetch models' }));
    throw new Error(errorData.message || errorData.error || 'Failed to fetch models');
  }
  
  const data = await response.json();
  return data.models || [];
}

export function useModels(category: ModelCategory) {
  return useQuery({
    queryKey: ['models', category],
    queryFn: () => fetchModels(category),
    staleTime: 10 * 60 * 1000, // 10 minutes - models don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

// Hook to fetch model counts for all categories
export function useModelCounts() {
  const categories: ModelCategory[] = [
    'text-to-image',
    'text-to-video',
    'image-to-video',
    'image-to-image',
    'video-to-video',
    'upscaling',
    'image-to-3d',
    'audio',
    'image-utilities',
  ];

  return useQuery({
    queryKey: ['model-counts'],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      
      await Promise.all(
        categories.map(async (category) => {
          try {
            const models = await fetchModels(category);
            counts[category] = models.length;
          } catch (error) {
            console.warn(`Failed to fetch count for ${category}:`, error);
            counts[category] = 0;
          }
        })
      );
      
      return counts;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
  });
}
