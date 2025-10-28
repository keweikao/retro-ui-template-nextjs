/**
 * Custom Hook: useImageGeneration
 * Manages state and API calls for AI image generation
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { ClientFormSchema } from '@/lib/schemas/image-generation';
import type {
  ImageGenerationAPIRequest,
  ImageGenerationAPIResponse,
  GeneratedImage,
  ImageGeneratorUIState,
  ImageGenerationRequest
} from '@/lib/types/image-generation';

interface UseImageGenerationOptions {
  onSuccess?: (image: GeneratedImage) => void;
  onError?: (error: string) => void;
  validateInput?: boolean;
  maxRetries?: number;
}

interface UseImageGenerationReturn {
  // State
  isLoading: boolean;
  error: string | null;
  generatedImage: GeneratedImage | null;
  inputValue: string;
  currentRequest: ImageGenerationRequest | null;

  // Actions
  setInputValue: (value: string) => void;
  generateImage: () => Promise<void>;
  clearError: () => void;
  clearImage: () => void;
  reset: () => void;

  // Computed
  isValid: boolean;
  canGenerate: boolean;
  validationError: string | null;
}

const initialState: ImageGeneratorUIState = {
  isLoading: false,
  error: null,
  currentRequest: null,
  generatedImage: null,
  inputValue: ''
};

export function useImageGeneration(options: UseImageGenerationOptions = {}): UseImageGenerationReturn {
  const {
    onSuccess,
    onError,
    validateInput = true,
    maxRetries = 3
  } = options;

  const [state, setState] = useState<ImageGeneratorUIState>(initialState);

  // Validate input in real-time
  const validatePrompt = useCallback((value: string) => {
    if (!validateInput) return null;

    const validation = ClientFormSchema.safeParse({ prompt: value });
    return validation.success ? null : validation.error.issues[0]?.message || 'Invalid input';
  }, [validateInput]);

  // Set input value with validation
  const setInputValue = useCallback((value: string) => {
    setState(prev => ({
      ...prev,
      inputValue: value,
      error: validateInput ? validatePrompt(value) : null
    }));
  }, [validatePrompt, validateInput]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Clear generated image
  const clearImage = useCallback(() => {
    setState(prev => ({ ...prev, generatedImage: null }));
  }, []);

  // Reset to initial state
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // Generate image with retry logic
  const generateImage = useCallback(async (retryCount = 0): Promise<void> => {
    const trimmedPrompt = state.inputValue.trim();

    // Client-side validation
    if (validateInput) {
      const validation = ClientFormSchema.safeParse({ prompt: trimmedPrompt });
      if (!validation.success) {
        const errorMessage = validation.error.issues[0]?.message || 'Please provide a valid prompt';
        setState(prev => ({ ...prev, error: errorMessage }));
        onError?.(errorMessage);
        return;
      }
    }

    // Create request
    const requestId = crypto.randomUUID();
    const request: ImageGenerationRequest = {
      id: requestId,
      prompt: trimmedPrompt,
      timestamp: new Date(),
      status: 'generating',
      model: 'gemini-2.5-flash-image-preview'
    };

    // Update state to loading
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      currentRequest: request,
      generatedImage: null // Clear previous image
    }));

    try {
      const requestBody: ImageGenerationAPIRequest = {
        prompt: trimmedPrompt,
        model: 'gemini-2.5-flash-image-preview'
      };

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data: ImageGenerationAPIResponse = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = !data.success ? data.message : `HTTP ${response.status}: Failed to generate image`;
        throw new Error(errorMessage);
      }

      // Create generated image object
      const generatedImage: GeneratedImage = {
        id: crypto.randomUUID(),
        requestId: data.requestId,
        imageUrl: data.imageUrl!,
        prompt: trimmedPrompt,
        generatedAt: new Date(data.generatedAt),
        dimensions: data.dimensions || { width: 512, height: 512 },
        fileSize: undefined
      };

      // Update state with success
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        currentRequest: {
          ...request,
          status: 'completed'
        },
        generatedImage
      }));

      onSuccess?.(generatedImage);

    } catch (error: unknown) {
      console.error('Image generation failed:', error);

      // Handle retries for transient errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      const shouldRetry = retryCount < maxRetries && (
        errorMessage?.includes('network') ||
        errorMessage?.includes('timeout') ||
        errorMessage?.includes('503') ||
        errorMessage?.includes('502')
      );

      if (shouldRetry) {
        console.log(`Retrying image generation (attempt ${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          generateImage(retryCount + 1);
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff
        return;
      }

      // Final error state
      const finalErrorMessage = errorMessage || 'Failed to generate image. Please try again.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: finalErrorMessage,
        currentRequest: {
          ...request,
          status: 'error'
        }
      }));

      onError?.(finalErrorMessage);
    }
  }, [state.inputValue, validateInput, maxRetries, onSuccess, onError]);

  // Computed values
  const validationError = validateInput ? validatePrompt(state.inputValue) : null;
  const isValid = !validationError && state.inputValue.trim().length > 0;
  const canGenerate = isValid && !state.isLoading;

  // Auto-clear errors when input changes (if it becomes valid)
  useEffect(() => {
    if (state.error && isValid) {
      clearError();
    }
  }, [state.error, isValid, clearError]);

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    generatedImage: state.generatedImage,
    inputValue: state.inputValue,
    currentRequest: state.currentRequest,

    // Actions
    setInputValue,
    generateImage: () => generateImage(0),
    clearError,
    clearImage,
    reset,

    // Computed
    isValid,
    canGenerate,
    validationError
  };
}

/**
 * Hook for responsive layout management
 */
interface UseResponsiveLayoutReturn {
  viewport: 'mobile' | 'tablet' | 'desktop';
  screenWidth: number;
  imageDisplayMode: 'stacked' | 'side-by-side';
  inputWidth: 'full' | 'constrained';
}

export function useResponsiveLayout(): UseResponsiveLayoutReturn {
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const viewport = screenWidth < 640 ? 'mobile' : screenWidth < 1024 ? 'tablet' : 'desktop';
  const imageDisplayMode = screenWidth >= 640 ? 'side-by-side' : 'stacked';
  const inputWidth = screenWidth >= 1024 ? 'constrained' : 'full';

  return {
    viewport,
    screenWidth,
    imageDisplayMode,
    inputWidth
  };
}