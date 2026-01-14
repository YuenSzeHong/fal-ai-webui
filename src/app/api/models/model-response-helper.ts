import { NextResponse } from 'next/server';

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
}

export function createModelResponse(category: string, models: ModelInfo[]) {
  try {
    console.log(`[Server] Fetching ${category} models - ${models.length} models available`);
    return NextResponse.json({ models });
  } catch (error) {
    console.error(`[Server] Error fetching ${category} models:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch models', models: [] },
      { status: 500 }
    );
  }
}
