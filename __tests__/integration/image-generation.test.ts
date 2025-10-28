/**
 * Integration Test: Complete Image Generation Flow
 * This test MUST fail initially (TDD approach)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '@/app/page';

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

// Mock Google AI SDK
jest.mock('@ai-sdk/google', () => ({
  google: jest.fn(() => 'mocked-model'),
}));

// Mock AI SDK functions
jest.mock('ai', () => ({
  generateObject: jest.fn(),
}));

describe('Image Generation Integration', () => {
  beforeEach(() => {
    // Mock environment variable
    process.env.GOOGLE_AI_API_KEY = 'test-api-key';

    // Reset fetch mock
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full user journey: homepage -> prompt input -> image generation -> display', async () => {
    const user = userEvent.setup();

    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        imageUrl: 'data:image/png;base64,mock-image-data',
        requestId: 'integration-test-id',
        generatedAt: new Date().toISOString(),
        dimensions: { width: 1024, height: 1024 },
        prompt: 'A futuristic city with flying cars'
      })
    });

    // Render homepage
    render(<HomePage />);

    // Step 1: Verify ImageGenerator is present on homepage
    expect(screen.getByTestId('image-generator')).toBeInTheDocument();

    // Step 2: Find and interact with prompt input
    const promptInput = screen.getByPlaceholderText(/describe the image/i);
    expect(promptInput).toBeInTheDocument();

    // Step 3: Enter a prompt
    const testPrompt = 'A futuristic city with flying cars';
    await user.type(promptInput, testPrompt);

    // Step 4: Verify generate button is enabled
    const generateButton = screen.getByRole('button', { name: /generate/i });
    expect(generateButton).toBeEnabled();

    // Step 5: Click generate button
    await user.click(generateButton);

    // Step 6: Verify loading state
    expect(screen.getByText(/generating/i)).toBeInTheDocument();
    expect(generateButton).toBeDisabled();

    // Step 7: Wait for image generation to complete
    await waitFor(
      () => {
        const generatedImage = screen.getByAltText(testPrompt);
        expect(generatedImage).toBeInTheDocument();
        expect(generatedImage).toHaveAttribute('src', 'data:image/png;base64,mock-image-data');
      },
      { timeout: 5000 }
    );

    // Step 8: Verify button returns to normal state
    expect(generateButton).toBeEnabled();
    expect(generateButton).toHaveTextContent(/generate/i);

    // Step 9: Verify API was called correctly
    expect(global.fetch).toHaveBeenCalledWith('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: testPrompt,
        model: 'gemini-2.5-flash-image-preview'
      })
    });
  });

  it('should handle error scenario gracefully throughout the flow', async () => {
    const user = userEvent.setup();

    // Mock API error response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({
        success: false,
        error: 'GENERATION_FAILED',
        message: 'Google AI service temporarily unavailable',
        requestId: 'error-test-id'
      })
    });

    render(<HomePage />);

    // Enter prompt
    const promptInput = screen.getByPlaceholderText(/describe the image/i);
    await user.type(promptInput, 'Test error prompt');

    // Click generate
    const generateButton = screen.getByRole('button', { name: /generate/i });
    await user.click(generateButton);

    // Verify loading state
    expect(screen.getByText(/generating/i)).toBeInTheDocument();

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/google ai service temporarily unavailable/i)).toBeInTheDocument();
    });

    // Verify button is re-enabled for retry
    expect(generateButton).toBeEnabled();
    expect(generateButton).toHaveTextContent(/generate/i);

    // Verify no image is displayed
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should handle network failure gracefully', async () => {
    const user = userEvent.setup();

    // Mock network error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    render(<HomePage />);

    const promptInput = screen.getByPlaceholderText(/describe the image/i);
    await user.type(promptInput, 'Network test prompt');

    const generateButton = screen.getByRole('button', { name: /generate/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    expect(generateButton).toBeEnabled();
  });

  it('should support multiple consecutive generations', async () => {
    const user = userEvent.setup();

    // Mock multiple successful responses
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          imageUrl: 'data:image/png;base64,first-image',
          requestId: 'first-request',
          generatedAt: new Date().toISOString()
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          imageUrl: 'data:image/png;base64,second-image',
          requestId: 'second-request',
          generatedAt: new Date().toISOString()
        })
      });

    render(<HomePage />);

    const promptInput = screen.getByPlaceholderText(/describe the image/i);
    const generateButton = screen.getByRole('button', { name: /generate/i });

    // First generation
    await user.type(promptInput, 'First prompt');
    await user.click(generateButton);

    await waitFor(() => {
      const firstImage = screen.getByAltText(/first prompt/i);
      expect(firstImage).toHaveAttribute('src', 'data:image/png;base64,first-image');
    });

    // Second generation - should replace first image
    await user.clear(promptInput);
    await user.type(promptInput, 'Second prompt');
    await user.click(generateButton);

    await waitFor(() => {
      const secondImage = screen.getByAltText(/second prompt/i);
      expect(secondImage).toHaveAttribute('src', 'data:image/png;base64,second-image');
    });

    // Verify only one image is displayed
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(1);
  });

  it('should maintain responsive design throughout the flow', async () => {
    const user = userEvent.setup();

    // Mock successful response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        imageUrl: 'data:image/png;base64,responsive-test-image',
        requestId: 'responsive-test'
      })
    });

    render(<HomePage />);

    // Find the main container
    const container = screen.getByTestId('image-generator');

    // Verify responsive classes are present
    expect(container).toHaveClass('flex', 'flex-col');

    // Test the flow
    const promptInput = screen.getByPlaceholderText(/describe the image/i);
    await user.type(promptInput, 'Responsive test');

    const generateButton = screen.getByRole('button', { name: /generate/i });
    await user.click(generateButton);

    await waitFor(() => {
      const image = screen.getByAltText(/responsive test/i);
      expect(image).toBeInTheDocument();
    });

    // Verify image has responsive classes
    const generatedImage = screen.getByAltText(/responsive test/i);
    expect(generatedImage.closest('div')).toHaveClass('w-full');
  });

  it('should validate input and prevent empty submissions', async () => {
    const user = userEvent.setup();

    render(<HomePage />);

    const promptInput = screen.getByPlaceholderText(/describe the image/i);
    const generateButton = screen.getByRole('button', { name: /generate/i });

    // Button should be disabled initially
    expect(generateButton).toBeDisabled();

    // Type and delete text
    await user.type(promptInput, 'Test');
    expect(generateButton).toBeEnabled();

    await user.clear(promptInput);
    expect(generateButton).toBeDisabled();

    // Try whitespace only
    await user.type(promptInput, '   ');
    expect(generateButton).toBeDisabled();

    // Verify fetch was never called
    expect(global.fetch).not.toHaveBeenCalled();
  });
});