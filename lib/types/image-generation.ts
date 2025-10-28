/**
 * TypeScript interfaces for Google AI Image Generation
 */

export interface ImageGenerationRequest {
  id: string;
  prompt: string;
  timestamp: Date;
  status: 'pending' | 'generating' | 'completed' | 'error';
  model: string;
}

export interface GeneratedImage {
  id: string;
  requestId: string;
  imageUrl: string;
  prompt: string;
  generatedAt: Date;
  dimensions: {
    width: number;
    height: number;
  };
  fileSize?: number;
}

export interface UIState {
  isLoading: boolean;
  error: string | null;
  currentRequest: ImageGenerationRequest | null;
  generatedImage: GeneratedImage | null;
  inputValue: string;
}

export interface APIConfiguration {
  apiKey: string;
  model: string;
  endpoint: string;
  timeout: number;
  maxRetries: number;
}

export interface ResponsiveLayout {
  viewport: 'mobile' | 'tablet' | 'desktop';
  screenWidth: number;
  imageDisplayMode: 'stacked' | 'side-by-side';
  inputWidth: 'full' | 'constrained';
}

// API Request/Response Types
export interface ImageGenerationAPIRequest {
  prompt: string;
  model?: string;
}

export interface SuccessResponse {
  success: true;
  imageUrl: string;
  requestId: string;
  generatedAt: Date;
  dimensions: {
    width: number;
    height: number;
  };
  prompt: string;
  model: string;
}

export interface ErrorResponse {
  success: false;
  error: ImageGenerationError;
  message: string;
  requestId: string;
  generatedAt: Date;
  details?: Record<string, unknown>;
}

export type ImageGenerationAPIResponse = SuccessResponse | ErrorResponse;

export interface ImageGeneratorUIState {
  isLoading: boolean;
  error: string | null;
  currentRequest: ImageGenerationRequest | null;
  generatedImage: GeneratedImage | null;
  inputValue: string;
}

// Error types
export type ImageGenerationError =
  | 'INVALID_PROMPT'
  | 'API_KEY_MISSING'
  | 'API_KEY_INVALID'
  | 'RATE_LIMIT_EXCEEDED'
  | 'MODEL_UNAVAILABLE'
  | 'GENERATION_FAILED'
  | 'INTERNAL_ERROR';

