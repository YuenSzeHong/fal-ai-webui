/**
 * Utility functions for aspect ratio and dimension calculations
 */

/**
 * Calculate best dimensions for a given aspect ratio and target size
 * @param ratio - Aspect ratio string like "16:9" or "1:1"
 * @param size - Target size (typically 1024 or 512)
 * @param tileSize - Tile size for rounding (typically 8 or 64)
 * @returns Object with calculated width and height
 */
export function calculateBestDimensions(
  ratio: string,
  size: number = 1024,
  tileSize: number = 8
): { width: number; height: number } {
  // Parse aspect ratio
  const parts = ratio.split(':').map(s => s.trim());
  if (parts.length !== 2) {
    throw new Error('Invalid aspect ratio format. Use format like "16:9"');
  }

  const w = parseInt(parts[0]);
  const h = parseInt(parts[1]);

  if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
    throw new Error('Invalid aspect ratio values. Must be positive numbers');
  }

  // Calculate dimensions using the formula
  const width = Math.round(Math.sqrt(size * size * w / h) / tileSize) * tileSize;
  const height = Math.round(Math.sqrt(size * size * h / w) / tileSize) * tileSize;

  return { width, height };
}

/**
 * Validate aspect ratio string format
 * @param ratio - Aspect ratio string to validate
 * @returns true if valid, false otherwise
 */
export function validateAspectRatio(ratio: string): boolean {
  const parts = ratio.split(':').map(s => s.trim());
  if (parts.length !== 2) {
    return false;
  }

  const w = parseInt(parts[0]);
  const h = parseInt(parts[1]);

  return !isNaN(w) && !isNaN(h) && w > 0 && h > 0;
}

/**
 * Get common aspect ratio presets
 */
export const ASPECT_RATIO_PRESETS = [
  { value: '1:1', label: '1:1 - Square' },
  { value: '4:3', label: '4:3 - Standard' },
  { value: '3:2', label: '3:2 - Photo' },
  { value: '16:9', label: '16:9 - Landscape' },
  { value: '21:9', label: '21:9 - Ultra Wide' },
  { value: '2:3', label: '2:3 - Portrait' },
  { value: '3:4', label: '3:4 - Portrait' },
  { value: '9:16', label: '9:16 - Mobile' },
  { value: '9:21', label: '9:21 - Ultra Tall' }
];

/**
 * Calculate aspect ratio from width and height
 * @param width - Image width
 * @param height - Image height
 * @returns Simplified aspect ratio string
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}
