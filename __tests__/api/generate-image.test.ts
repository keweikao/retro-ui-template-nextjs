/**
 * API Route Test: /api/generate-image
 * This test MUST fail initially (TDD approach)
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/generate-image/route';
import type { ImageGenerationAPIRequest, ImageGenerationAPIResponse } from '@/lib/types/image-generation';

// Mock Google AI SDK
jest.mock('@ai-sdk/google', () => ({
  google: jest.fn(() => ({
    generateImage: jest.fn()
  }))
}));

describe('/api/generate-image', () => {
  beforeEach(() => {
    // Set up environment variable
    process.env.GOOGLE_AI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/generate-image', () => {
    it('should generate image successfully with valid prompt', async () => {
      const requestBody: ImageGenerationAPIRequest = {
        prompt: 'A beautiful sunset over mountains',
        model: 'gemini-2.5-flash-image-preview'
      };

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data: ImageGenerationAPIResponse = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.imageUrl).toBeDefined();
      expect(data.requestId).toBeDefined();
      expect(data.generatedAt).toBeDefined();
      expect(data.prompt).toBe(requestBody.prompt);
    });

    it('should return 400 for empty prompt', async () => {
      const requestBody: ImageGenerationAPIRequest = {
        prompt: '',
        model: 'gemini-2.5-flash-image-preview'
      };

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('INVALID_PROMPT');
    });

    it('should return 401 when API key is missing', async () => {
      delete process.env.GOOGLE_AI_API_KEY;

      const requestBody: ImageGenerationAPIRequest = {
        prompt: 'Test prompt'
      };

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('API_KEY_MISSING');
    });

    it('should handle Google AI API failures gracefully', async () => {
      // Mock Google AI to throw an error
      const { google } = require('@ai-sdk/google');
      google.mockImplementation(() => ({
        generateImage: jest.fn().mockRejectedValue(new Error('Google AI API Error'))
      }));

      const requestBody: ImageGenerationAPIRequest = {
        prompt: 'Test prompt'
      };

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('GENERATION_FAILED');
    });

    it('should validate prompt length limits', async () => {
      const longPrompt = 'A'.repeat(1001); // Exceeds 1000 character limit
      const requestBody: ImageGenerationAPIRequest = {
        prompt: longPrompt
      };

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('INVALID_PROMPT');
    });

    it('should return proper response format', async () => {
      const requestBody: ImageGenerationAPIRequest = {
        prompt: 'A simple test image'
      };

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data: ImageGenerationAPIResponse = await response.json();

      // Test response structure
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('requestId');
      expect(data).toHaveProperty('generatedAt');

      if (data.success) {
        expect(data).toHaveProperty('imageUrl');
        expect(data).toHaveProperty('dimensions');
        expect(data.dimensions).toHaveProperty('width');
        expect(data.dimensions).toHaveProperty('height');
      } else {
        expect(data).toHaveProperty('error');
        expect(data).toHaveProperty('message');
      }
    });
  });
});