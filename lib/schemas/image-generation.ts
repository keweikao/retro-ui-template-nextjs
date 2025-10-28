/**
 * Zod validation schemas for Google AI Image Generation
 */

import { z } from 'zod';

// API Request Schema
export const ImageGenerationRequestSchema = z.object({
  prompt: z.string()
    .min(1, 'Prompt cannot be empty')
    .max(1000, 'Prompt must be 1000 characters or less')
    .trim(),
  model: z.string()
    .optional()
    .default('gemini-2.5-flash-image-preview')
    .refine(
      (val) => ['gemini-2.5-flash-image-preview'].includes(val),
      'Invalid model specified'
    )
});

// API Response Schema
export const ImageGenerationResponseSchema = z.object({
  success: z.boolean(),
  imageUrl: z.string().url().optional(),
  error: z.enum([
    'INVALID_PROMPT',
    'API_KEY_MISSING',
    'API_KEY_INVALID',
    'RATE_LIMIT_EXCEEDED',
    'MODEL_UNAVAILABLE',
    'GENERATION_FAILED',
    'INTERNAL_ERROR'
  ]).optional(),
  message: z.string().optional(),
  requestId: z.string().uuid(),
  generatedAt: z.string().datetime(),
  dimensions: z.object({
    width: z.number().positive(),
    height: z.number().positive()
  }).optional(),
  prompt: z.string().optional(),
  model: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional()
});

// UI State Schema
export const UIStateSchema = z.object({
  isLoading: z.boolean().default(false),
  error: z.string().nullable().default(null),
  currentRequest: z.object({
    id: z.string().uuid(),
    prompt: z.string().min(1),
    timestamp: z.date(),
    status: z.enum(['pending', 'generating', 'completed', 'error']),
    model: z.string()
  }).nullable().default(null),
  generatedImage: z.object({
    id: z.string().uuid(),
    requestId: z.string().uuid(),
    imageUrl: z.string().url(),
    prompt: z.string(),
    generatedAt: z.date(),
    dimensions: z.object({
      width: z.number().positive(),
      height: z.number().positive()
    }),
    fileSize: z.number().positive().optional()
  }).nullable().default(null),
  inputValue: z.string().default('')
});

// Environment Configuration Schema
export const APIConfigurationSchema = z.object({
  apiKey: z.string().min(1, 'Google AI API key is required'),
  model: z.string().default('gemini-2.5-flash-image-preview'),
  endpoint: z.string().url().default('https://generativelanguage.googleapis.com'),
  timeout: z.number().positive().default(30000),
  maxRetries: z.number().min(0).max(5).default(3)
});

// Responsive Layout Schema
export const ResponsiveLayoutSchema = z.object({
  viewport: z.enum(['mobile', 'tablet', 'desktop']),
  screenWidth: z.number().positive(),
  imageDisplayMode: z.enum(['stacked', 'side-by-side']),
  inputWidth: z.enum(['full', 'constrained'])
});

// Client-side form validation
export const ClientFormSchema = z.object({
  prompt: z.string()
    .min(1, 'Please describe the image you want to generate')
    .max(1000, 'Description must be 1000 characters or less')
    .refine(
      (val) => val.trim().length > 0,
      'Prompt cannot be only whitespace'
    )
    .refine(
      (val) => !/^\s*$/.test(val),
      'Please provide a meaningful description'
    )
});

// Type exports for TypeScript inference
export type ImageGenerationRequest = z.infer<typeof ImageGenerationRequestSchema>;
export type ImageGenerationResponse = z.infer<typeof ImageGenerationResponseSchema>;
export type UIState = z.infer<typeof UIStateSchema>;
export type APIConfiguration = z.infer<typeof APIConfigurationSchema>;
export type ResponsiveLayout = z.infer<typeof ResponsiveLayoutSchema>;
export type ClientForm = z.infer<typeof ClientFormSchema>;