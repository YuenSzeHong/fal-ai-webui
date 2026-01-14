import { route } from "@fal-ai/server-proxy/nextjs";

// Check if FAL_KEY is set
if (!process.env.FAL_KEY) {
  console.error('[Server] FAL_KEY environment variable is not set. Please add it to .env.local');
}

export const { GET, POST, PUT } = route; 