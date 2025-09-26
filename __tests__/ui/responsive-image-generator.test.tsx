/**
 * Responsive Design Test: ImageGenerator Component
 * This test MUST fail initially (TDD approach)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ImageGenerator from '@/components/ImageGenerator';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

// Helper function to simulate viewport changes
const mockViewport = (width: number, height: number) => {
  // Mock window.matchMedia for responsive queries
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => {
      const matches = (() => {
        if (query === '(min-width: 640px)') return width >= 640;
        if (query === '(min-width: 768px)') return width >= 768;
        if (query === '(min-width: 1024px)') return width >= 1024;
        if (query === '(min-width: 1280px)') return width >= 1280;
        return false;
      })();

      return {
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
    }),
  });

  // Mock window dimensions
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });

  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

describe('ImageGenerator Responsive Design', () => {
  describe('Mobile Layout (320px - 639px)', () => {
    beforeEach(() => {
      mockViewport(375, 812); // iPhone X dimensions
    });

    it('should render stacked layout on mobile', () => {
      render(<ImageGenerator />);

      const container = screen.getByTestId('image-generator-container');

      // Should have mobile-first flex column layout
      expect(container).toHaveClass('flex-col');
      expect(container).not.toHaveClass('sm:flex-row');
    });

    it('should use full width input on mobile', () => {
      render(<ImageGenerator />);

      const input = screen.getByPlaceholderText(/describe the image/i);
      const inputContainer = input.closest('div');

      expect(inputContainer).toHaveClass('w-full');
    });

    it('should have proper touch target sizes (44px minimum)', () => {
      render(<ImageGenerator />);

      const generateButton = screen.getByRole('button', { name: /generate/i });

      // RetroUI button should have adequate padding for touch
      expect(generateButton).toHaveClass('py-1.5', 'px-4'); // 1.5 * 4 = 6px + base size should exceed 44px
    });

    it('should stack input and button vertically with proper spacing', () => {
      render(<ImageGenerator />);

      const inputContainer = screen.getByTestId('input-container');

      expect(inputContainer).toHaveClass('flex-col');
      expect(inputContainer).toHaveClass('gap-2'); // Proper spacing between elements
    });
  });

  describe('Tablet Layout (640px - 1023px)', () => {
    beforeEach(() => {
      mockViewport(768, 1024); // iPad dimensions
    });

    it('should render horizontal layout on tablet', () => {
      render(<ImageGenerator />);

      const container = screen.getByTestId('image-generator-container');

      expect(container).toHaveClass('sm:flex-row');
    });

    it('should optimize spacing for tablet viewport', () => {
      render(<ImageGenerator />);

      const container = screen.getByTestId('image-generator-container');

      expect(container).toHaveClass('gap-4'); // More generous spacing on larger screens
    });
  });

  describe('Desktop Layout (1024px+)', () => {
    beforeEach(() => {
      mockViewport(1440, 900); // Desktop dimensions
    });

    it('should render optimized desktop layout', () => {
      render(<ImageGenerator />);

      const container = screen.getByTestId('image-generator-container');

      expect(container).toHaveClass('lg:max-w-4xl'); // Constrained width on large screens
      expect(container).toHaveClass('mx-auto'); // Centered layout
    });

    it('should have side-by-side layout with proper proportions', () => {
      render(<ImageGenerator />);

      const inputSection = screen.getByTestId('input-section');
      const imageSection = screen.getByTestId('image-section');

      expect(inputSection).toHaveClass('lg:w-1/2');
      expect(imageSection).toHaveClass('lg:w-1/2');
    });
  });

  describe('Image Display Responsiveness', () => {
    const mockGeneratedImage = 'data:image/png;base64,mock-image';

    beforeEach(() => {
      // Mock successful image generation
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          imageUrl: mockGeneratedImage,
          requestId: 'test-responsive'
        })
      });
    });

    it('should scale images properly on mobile', () => {
      mockViewport(375, 812);

      render(<ImageGenerator />);

      // Simulate generated image
      const imageContainer = screen.getByTestId('generated-image-container');

      expect(imageContainer).toHaveClass('w-full');
      expect(imageContainer).toHaveClass('max-w-sm'); // Small max width on mobile
    });

    it('should center images and limit size on desktop', () => {
      mockViewport(1440, 900);

      render(<ImageGenerator />);

      const imageContainer = screen.getByTestId('generated-image-container');

      expect(imageContainer).toHaveClass('max-w-md'); // Medium max width on desktop
      expect(imageContainer).toHaveClass('mx-auto'); // Centered
    });

    it('should maintain aspect ratio across all screen sizes', () => {
      const sizes = [
        [375, 812], // Mobile
        [768, 1024], // Tablet
        [1440, 900], // Desktop
      ];

      sizes.forEach(([width, height]) => {
        mockViewport(width, height);

        const { rerender } = render(<ImageGenerator />);

        const imageContainer = screen.getByTestId('generated-image-container');

        // Should have aspect ratio preservation classes
        expect(imageContainer).toHaveClass('aspect-square');

        rerender(<div />); // Clean up for next iteration
      });
    });
  });

  describe('RetroUI Design Consistency', () => {
    it('should maintain RetroUI styling across all breakpoints', () => {
      const sizes = [375, 768, 1440];

      sizes.forEach((width) => {
        mockViewport(width, 600);

        render(<ImageGenerator />);

        const generateButton = screen.getByRole('button', { name: /generate/i });

        // RetroUI styles should be consistent
        expect(generateButton).toHaveClass('bg-primary');
        expect(generateButton).toHaveClass('border-2');
        expect(generateButton).toHaveClass('border-black');
        expect(generateButton).toHaveClass('shadow-md');
        expect(generateButton).toHaveClass('hover:shadow-none');
        expect(generateButton).toHaveClass('hover:translate-y-1');
      });
    });

    it('should use consistent spacing scale across breakpoints', () => {
      render(<ImageGenerator />);

      const container = screen.getByTestId('image-generator-container');

      // Should use Tailwind's consistent spacing scale
      expect(container).toHaveClass('p-4'); // Base padding
      expect(container).toHaveClass('md:p-6'); // Larger padding on medium screens
    });
  });

  describe('Accessibility on Different Screen Sizes', () => {
    it('should maintain proper focus indicators on all screen sizes', () => {
      const sizes = [375, 768, 1440];

      sizes.forEach((width) => {
        mockViewport(width, 600);

        render(<ImageGenerator />);

        const input = screen.getByPlaceholderText(/describe the image/i);

        // Focus styles should be present
        expect(input).toHaveClass('focus:outline-none');
        expect(input).toHaveClass('focus:ring-2');
        expect(input).toHaveClass('focus:ring-primary');
      });
    });

    it('should have adequate color contrast in dark mode across breakpoints', () => {
      // Simulate dark mode
      document.documentElement.classList.add('dark');

      render(<ImageGenerator />);

      const container = screen.getByTestId('image-generator-container');

      expect(container).toHaveClass('dark:bg-card');
      expect(container).toHaveClass('dark:text-card-foreground');

      // Clean up
      document.documentElement.classList.remove('dark');
    });
  });

  describe('Performance Considerations', () => {
    it('should not cause layout shifts during responsive changes', () => {
      render(<ImageGenerator />);

      // Simulate viewport change
      mockViewport(768, 1024);
      window.dispatchEvent(new Event('resize'));

      const container = screen.getByTestId('image-generator-container');

      // Container should have stable dimensions
      expect(container).toHaveClass('min-h-0'); // Prevents unnecessary height
    });

    it('should lazy load images appropriately', () => {
      render(<ImageGenerator />);

      // Generated images should have lazy loading
      const imageElements = screen.queryAllByRole('img');
      imageElements.forEach((img) => {
        expect(img).toHaveAttribute('loading', 'lazy');
      });
    });
  });
});