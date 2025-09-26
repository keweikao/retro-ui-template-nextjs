/**
 * ImageGenerator Component with RetroUI Styling
 * AI-powered image generation using Google Gemini 2.5 Flash
 */

'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/retroui/Button';
import { cn } from '@/lib/utils';
import { ClientFormSchema } from '@/lib/schemas/image-generation';
import type {
  ImageGenerationAPIRequest,
  ImageGenerationAPIResponse,
  GeneratedImage,
  ImageGeneratorUIState
} from '@/lib/types/image-generation';

interface ImageGeneratorProps {
  className?: string;
}

export default function ImageGenerator({ className }: ImageGeneratorProps) {
  const [state, setState] = useState<ImageGeneratorUIState>({
    isLoading: false,
    error: null,
    currentRequest: null,
    generatedImage: null,
    inputValue: ''
  });

  // Validate input in real-time
  const validateInput = useCallback((value: string) => {
    const validation = ClientFormSchema.safeParse({ prompt: value });
    return validation.success ? null : validation.error.issues[0]?.message || 'Invalid input';
  }, []);

  // Handle input change with validation
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setState(prev => ({
      ...prev,
      inputValue: value,
      error: value ? validateInput(value) : null
    }));
  }, [validateInput]);

  // Generate image using API
  const generateImage = useCallback(async () => {
    const trimmedPrompt = state.inputValue.trim();

    // Client-side validation
    const validation = ClientFormSchema.safeParse({ prompt: trimmedPrompt });
    if (!validation.success) {
      setState(prev => ({
        ...prev,
        error: validation.error.issues[0]?.message || 'Please provide a valid prompt'
      }));
      return;
    }

    // Create request
    const requestId = crypto.randomUUID();
    const request = {
      id: requestId,
      prompt: trimmedPrompt,
      timestamp: new Date(),
      status: 'generating' as const,
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
        fileSize: undefined // Not provided by API
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

    } catch (error: unknown) {
      console.error('Image generation failed:', error);

      // Update state with error
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate image. Please try again.',
        currentRequest: {
          ...request,
          status: 'error'
        }
      }));
    }
  }, [state.inputValue]);

  // Check if generate button should be disabled
  const isGenerateDisabled = useCallback(() => {
    if (state.isLoading) return true;
    if (!state.inputValue.trim()) return true;
    if (state.error) return true;
    return false;
  }, [state.isLoading, state.inputValue, state.error]);

  return (
    <div
      className={cn(
        'flex flex-col gap-4 p-4 md:p-6 w-full max-w-4xl mx-auto',
        className
      )}
      data-testid="image-generator-container"
    >
      {/* Input Section */}
      <div
        className="flex flex-col sm:flex-row gap-2 sm:gap-4"
        data-testid="input-container"
      >
        <div className="flex-1" data-testid="input-section">
          <input
            type="text"
            value={state.inputValue}
            onChange={handleInputChange}
            placeholder="Describe the image you want to generate..."
            className={cn(
              'w-full px-3 py-2 border-2 border-black rounded shadow-md',
              'focus:shadow-none focus:translate-y-1 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
              'bg-white text-foreground placeholder-muted-foreground',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              state.error && 'border-destructive focus:ring-destructive'
            )}
            disabled={state.isLoading}
            maxLength={1000}
            aria-describedby={state.error ? 'prompt-error' : undefined}
            aria-invalid={!!state.error}
          />

          {/* Error Message */}
          {state.error && (
            <p
              id="prompt-error"
              className="mt-1 text-sm text-destructive font-medium"
              role="alert"
            >
              {state.error}
            </p>
          )}

          {/* Character Count */}
          <p className="mt-1 text-xs text-muted-foreground">
            {state.inputValue.length}/1000 characters
          </p>
        </div>

        <Button
          variant="default"
          size="lg"
          onClick={generateImage}
          disabled={isGenerateDisabled()}
          className={cn(
            'sm:min-w-32',
            state.isLoading && 'cursor-not-allowed'
          )}
          aria-describedby="generate-button-help"
        >
          {state.isLoading ? 'Generating...' : 'Generate'}
        </Button>
      </div>

      {/* Helper Text */}
      <p
        id="generate-button-help"
        className="text-sm text-muted-foreground"
      >
        Enter a description and click Generate to create an AI image using Google Gemini 2.5 Flash.
      </p>

      {/* Generated Image Display */}
      {state.generatedImage && (
        <div
          className="mt-6"
          data-testid="image-section"
        >
          <div
            className={cn(
              'w-full max-w-md mx-auto',
              'border-2 border-black rounded shadow-md',
              'bg-card overflow-hidden',
              'aspect-square' // Maintain aspect ratio
            )}
            data-testid="generated-image-container"
          >
            <Image
              src={state.generatedImage.imageUrl}
              alt={state.generatedImage.prompt}
              width={state.generatedImage.dimensions.width}
              height={state.generatedImage.dimensions.height}
              className="w-full h-full object-cover"
              loading="lazy"
              priority={false}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>

          {/* Image Metadata */}
          <div className="mt-2 text-center">
            <p className="text-sm font-medium text-foreground">
              {state.generatedImage.prompt}
            </p>
            <p className="text-xs text-muted-foreground">
              Generated {state.generatedImage.generatedAt.toLocaleString()} •
              {state.generatedImage.dimensions.width}×{state.generatedImage.dimensions.height}
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {state.isLoading && (
        <div
          className="mt-6 text-center"
          data-testid="loading-state"
        >
          <div className="inline-flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
            <span className="text-sm text-muted-foreground">
              Generating your image... This may take up to 30 seconds.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

ImageGenerator.displayName = 'ImageGenerator';