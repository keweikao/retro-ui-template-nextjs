/**
 * Component Test: ImageGenerator
 * This test MUST fail initially (TDD approach)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageGenerator from '@/components/ImageGenerator';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

describe('ImageGenerator', () => {
  beforeEach(() => {
    // Reset fetch mock
    (fetch as jest.Mock).mockClear();
  });

  it('should render input field and generate button', () => {
    render(<ImageGenerator />);

    expect(screen.getByPlaceholderText(/describe the image/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
  });

  it('should disable generate button when input is empty', () => {
    render(<ImageGenerator />);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    expect(generateButton).toBeDisabled();
  });

  it('should enable generate button when input has text', async () => {
    const user = userEvent.setup();
    render(<ImageGenerator />);

    const input = screen.getByPlaceholderText(/describe the image/i);
    const generateButton = screen.getByRole('button', { name: /generate/i });

    await user.type(input, 'A beautiful sunset');

    expect(generateButton).toBeEnabled();
  });

  it('should show loading state when generating image', async () => {
    const user = userEvent.setup();

    // Mock successful API response with delay
    (fetch as jest.Mock).mockImplementation(() =>
      new Promise((resolve) =>
        setTimeout(() =>
          resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              imageUrl: 'data:image/png;base64,test-image-data',
              requestId: 'test-id',
              generatedAt: new Date().toISOString()
            })
          }), 100)
      )
    );

    render(<ImageGenerator />);

    const input = screen.getByPlaceholderText(/describe the image/i);
    const generateButton = screen.getByRole('button', { name: /generate/i });

    await user.type(input, 'A beautiful sunset');
    await user.click(generateButton);

    expect(screen.getByText(/generating/i)).toBeInTheDocument();
    expect(generateButton).toBeDisabled();
  });

  it('should display generated image after successful generation', async () => {
    const user = userEvent.setup();
    const mockImageUrl = 'data:image/png;base64,test-image-data';

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        imageUrl: mockImageUrl,
        requestId: 'test-id',
        generatedAt: new Date().toISOString(),
        dimensions: { width: 512, height: 512 }
      })
    });

    render(<ImageGenerator />);

    const input = screen.getByPlaceholderText(/describe the image/i);
    const generateButton = screen.getByRole('button', { name: /generate/i });

    await user.type(input, 'A beautiful sunset');
    await user.click(generateButton);

    await waitFor(() => {
      const image = screen.getByAltText(/a beautiful sunset/i);
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', mockImageUrl);
    });
  });

  it('should display error message when generation fails', async () => {
    const user = userEvent.setup();

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        success: false,
        error: 'GENERATION_FAILED',
        message: 'Failed to generate image',
        requestId: 'test-id'
      })
    });

    render(<ImageGenerator />);

    const input = screen.getByPlaceholderText(/describe the image/i);
    const generateButton = screen.getByRole('button', { name: /generate/i });

    await user.type(input, 'A beautiful sunset');
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to generate image/i)).toBeInTheDocument();
    });
  });

  it('should use RetroUI Button with correct styling', () => {
    render(<ImageGenerator />);

    const generateButton = screen.getByRole('button', { name: /generate/i });

    // Check for RetroUI-specific classes
    expect(generateButton).toHaveClass('bg-primary');
    expect(generateButton).toHaveClass('border-2');
    expect(generateButton).toHaveClass('border-black');
    expect(generateButton).toHaveClass('shadow-md');
  });

  it('should have responsive design classes', () => {
    render(<ImageGenerator />);

    const container = screen.getByTestId('image-generator-container');

    // Check for responsive classes
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('flex-col');
    expect(container).toHaveClass('sm:flex-row'); // Side-by-side on larger screens
  });

  it('should handle input validation for long prompts', async () => {
    const user = userEvent.setup();
    const longPrompt = 'A'.repeat(1001); // Exceeds limit

    render(<ImageGenerator />);

    const input = screen.getByPlaceholderText(/describe the image/i);
    const generateButton = screen.getByRole('button', { name: /generate/i });

    await user.type(input, longPrompt);

    expect(generateButton).toBeDisabled();
    expect(screen.getByText(/prompt too long/i)).toBeInTheDocument();
  });

  it('should clear error when new generation starts', async () => {
    const user = userEvent.setup();

    // First, create an error
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        success: false,
        error: 'GENERATION_FAILED',
        message: 'Failed to generate image'
      })
    });

    render(<ImageGenerator />);

    const input = screen.getByPlaceholderText(/describe the image/i);
    const generateButton = screen.getByRole('button', { name: /generate/i });

    await user.type(input, 'First prompt');
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to generate image/i)).toBeInTheDocument();
    });

    // Now mock successful response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        imageUrl: 'data:image/png;base64,test-image-data',
        requestId: 'test-id-2'
      })
    });

    // Clear input and type new prompt
    await user.clear(input);
    await user.type(input, 'Second prompt');
    await user.click(generateButton);

    // Error should be cleared
    expect(screen.queryByText(/failed to generate image/i)).not.toBeInTheDocument();
  });

  it('should maintain input focus for accessibility', async () => {
    const user = userEvent.setup();
    render(<ImageGenerator />);

    const input = screen.getByPlaceholderText(/describe the image/i);

    await user.click(input);
    expect(input).toHaveFocus();
  });
});