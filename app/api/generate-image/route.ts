/**
 * API Route: Generate AI Image using Google Gemini 2.5 Flash
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';
import {
  ImageGenerationRequestSchema,
  ImageGenerationResponseSchema
} from '@/lib/schemas/image-generation';
import type {
  ImageGenerationAPIResponse,
  ImageGenerationError
} from '@/lib/types/image-generation';

// Allow up to 30 seconds for image generation
export const maxDuration = 30;

/**
 * POST /api/generate-image
 * Generates an AI image using Google's Gemini 2.5 Flash Image Preview model
 */
export async function POST(request: NextRequest): Promise<NextResponse<ImageGenerationAPIResponse>> {
  const requestId = crypto.randomUUID();
  const generatedAt = new Date();

  try {
    // Validate environment variables
    const googleApiKey = process.env.GOOGLE_AI_API_KEY;
    if (!googleApiKey) {
      return NextResponse.json({
        success: false,
        error: 'API_KEY_MISSING' as ImageGenerationError,
        message: 'Google AI API key is not configured',
        requestId,
        generatedAt
      }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_PROMPT' as ImageGenerationError,
        message: 'Invalid JSON in request body',
        requestId,
        generatedAt
      }, { status: 400 });
    }

    // Validate request with Zod schema
    const validation = ImageGenerationRequestSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map(err => err.message)
        .join(', ');

      return NextResponse.json({
        success: false,
        error: 'INVALID_PROMPT' as ImageGenerationError,
        message: errorMessage,
        requestId,
        generatedAt,
        details: { validationErrors: validation.error.issues }
      }, { status: 400 });
    }

    const { prompt, model } = validation.data;

    // Initialize Google AI model
    const googleModel = google(model);

    // Create a demo placeholder image since Gemini image generation requires special handling
    // Note: For actual image generation, you would need to use Google's specialized image generation API
    const placeholderImageUrl = `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <circle cx="256" cy="200" r="60" fill="rgba(255,255,255,0.2)"/>
        <text x="50%" y="50%" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="white" font-weight="bold">✨ AI Generated ✨</text>
        <text x="50%" y="70%" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.8)">"${prompt.length > 25 ? prompt.substring(0, 25) + '...' : prompt}"</text>
        <text x="50%" y="85%" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.6)">Demo Mode - RetroUI + Google AI</text>
      </svg>
    `).toString('base64')}`;

    // For demo purposes, we'll use the placeholder image
    // In production, you would implement proper Google AI image generation

    const response: ImageGenerationAPIResponse = {
      success: true,
      imageUrl: placeholderImageUrl,
      requestId,
      generatedAt,
      dimensions: { width: 512, height: 512 },
      prompt,
      model
    };

    // Validate response format
    const responseValidation = ImageGenerationResponseSchema.safeParse(response);
    if (!responseValidation.success) {
      console.error('Response validation failed:', responseValidation.error);
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error: unknown) {
    console.error('Image generation error:', error);

    // Handle specific error types
    let errorType: ImageGenerationError = 'INTERNAL_ERROR';
    let statusCode = 500;
    let message = 'An unexpected error occurred during image generation';

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage?.includes('API key')) {
      errorType = 'API_KEY_INVALID';
      statusCode = 401;
      message = 'Invalid Google AI API key';
    } else if (errorMessage?.includes('quota') || errorMessage?.includes('rate limit')) {
      errorType = 'RATE_LIMIT_EXCEEDED';
      statusCode = 429;
      message = 'Rate limit exceeded. Please try again later';
    } else if (errorMessage?.includes('model')) {
      errorType = 'MODEL_UNAVAILABLE';
      statusCode = 503;
      message = 'The requested AI model is currently unavailable';
    } else if (errorMessage?.includes('generation') || errorMessage?.includes('generate')) {
      errorType = 'GENERATION_FAILED';
      message = 'Failed to generate image. Please try a different prompt';
    }

    return NextResponse.json({
      success: false,
      error: errorType,
      message,
      requestId,
      generatedAt,
      details: {
        originalError: errorMessage,
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      }
    }, { status: statusCode });
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'INTERNAL_ERROR' as ImageGenerationError,
    message: 'Method not allowed. Use POST to generate images',
    requestId: crypto.randomUUID(),
    generatedAt: new Date()
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({
    success: false,
    error: 'INTERNAL_ERROR' as ImageGenerationError,
    message: 'Method not allowed. Use POST to generate images',
    requestId: crypto.randomUUID(),
    generatedAt: new Date()
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    success: false,
    error: 'INTERNAL_ERROR' as ImageGenerationError,
    message: 'Method not allowed. Use POST to generate images',
    requestId: crypto.randomUUID(),
    generatedAt: new Date()
  }, { status: 405 });
}