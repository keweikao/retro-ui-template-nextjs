# Quickstart: Google AI Image Generation with RetroUI

## Prerequisites
- Next.js project with App Router and RetroUI components
- pnpm package manager
- Google AI API key with Gemini 2.5 Flash access

## Installation Test Scenarios

### Scenario 1: Google AI SDK Installation
```bash
# Test: Install Google AI provider for Vercel AI SDK
pnpm add @ai-sdk/google

# Expected: Package installed without conflicts
# Verify: Check package.json contains @ai-sdk/google dependency
```

### Scenario 2: API Key Configuration
```bash
# Test: Configure Google AI API key
cp .env.example .env.local
# Add: GOOGLE_AI_API_KEY=your_google_ai_key_here

# Expected: Environment variable loaded in development
# Verify: process.env.GOOGLE_AI_API_KEY available in API routes (server-side only)
```

### Scenario 3: RetroUI Component Integration Test
```tsx
// Test: Verify RetroUI Button component works with image generation
import { Button } from '@/components/retroui/Button';

export default function TestPage() {
  return (
    <Button
      variant="default"
      size="lg"
      onClick={() => console.log('RetroUI button clicked')}
    >
      Generate Image
    </Button>
  );
}

# Expected: Button renders with yellow background, black border, shadow effects
# Verify: Hover animation (translate-y-1) and shadow changes work
```

### Scenario 4: Basic Image Generation API Test
```typescript
// Test: Create /app/api/generate-image/route.ts
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await generateObject({
    model: google('gemini-2.5-flash-image-preview'),
    prompt: `Generate an image: ${prompt}`,
    schema: z.object({
      imageUrl: z.string(),
      dimensions: z.object({
        width: z.number(),
        height: z.number()
      })
    })
  });

  return Response.json({
    success: true,
    requestId: crypto.randomUUID(),
    ...result.object,
    generatedAt: new Date().toISOString()
  });
}

# Expected: API responds with generated image data
# Verify: curl -X POST /api/generate-image -d '{"prompt":"test"}' returns JSON
```

### Scenario 5: Responsive Image Generator Component
```tsx
// Test: Create responsive image generator with RetroUI styling
'use client';

import { useState } from 'react';
import { Button } from '@/components/retroui/Button';
import Image from 'next/image';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateImage = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedImage(data.imageUrl);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          className="flex-1 px-3 py-2 border-2 border-black rounded shadow-md focus:shadow-none focus:translate-y-1 transition-all"
        />
        <Button
          onClick={generateImage}
          disabled={isLoading || !prompt.trim()}
          size="lg"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </Button>
      </div>

      {generatedImage && (
        <div className="mt-4">
          <Image
            src={generatedImage}
            alt={prompt}
            width={512}
            height={512}
            className="w-full max-w-md mx-auto rounded border-2 border-black shadow-md"
          />
        </div>
      )}
    </div>
  );
}

# Expected: Component renders with RetroUI styling and responsive layout
# Verify: Input and button stack on mobile, side-by-side on desktop
```

## Integration Validation Steps

### Step 1: Development Server with Homepage Integration
```bash
pnpm dev
# Navigate to http://localhost:3000
# Expected: Homepage loads with image generator interface
# Verify: RetroUI styling consistent with existing design
```

### Step 2: Responsive Design Test
```bash
# Test various viewport sizes
# Mobile (320px-640px): Stacked layout, full-width input
# Tablet (640px-1024px): Optimized spacing, larger buttons
# Desktop (1024px+): Side-by-side layout, constrained width

# Expected: Seamless responsive behavior across all devices
# Verify: Touch targets are 44px+ on mobile, proper spacing maintained
```

### Step 3: Image Generation Flow Test
```bash
# Test complete user journey:
1. Enter prompt: "A sunset over mountains"
2. Click Generate button
3. Observe loading state (button shows "Generating...")
4. Wait for image generation (up to 30 seconds)
5. Verify image displays below input

# Expected: Smooth user experience with proper feedback
# Verify: Loading states, error handling, image display
```

### Step 4: Error Handling Test
```bash
# Test error scenarios:

# Invalid API key:
unset GOOGLE_AI_API_KEY
# Expected: Clear error message, no crashes

# Empty prompt:
# Submit empty or whitespace-only prompt
# Expected: Button remains disabled, validation message

# Network error:
# Disconnect internet during generation
# Expected: Timeout error with retry option

# Rate limiting:
# Make multiple rapid requests
# Expected: Rate limit error with helpful message
```

### Step 5: Performance and Build Test
```bash
# Type checking
pnpm type-check
# Expected: No TypeScript errors

# Build test
pnpm build
# Expected: Successful production build

# Bundle analysis
pnpm build --analyze
# Expected: Google AI SDK properly tree-shaken, optimal bundle size
```

### Step 6: RetroUI Design Consistency Test
```bash
# Visual design verification:
1. Button uses primary yellow (#ffdb33) background
2. Black borders (2px) on all interactive elements
3. Shadow effects with hover animations (translate-y-1)
4. Consistent typography using Geist Sans
5. Proper spacing using Tailwind scale
6. Dark mode compatibility maintained

# Expected: Perfect visual consistency with existing RetroUI components
# Verify: Design looks cohesive with homepage and other elements
```

## Success Criteria

### ✅ Installation Complete When:
- Google AI SDK installed via pnpm without conflicts
- API key configured and accessible server-side
- RetroUI components integrated and styled correctly

### ✅ Integration Complete When:
- Homepage modified with image generator interface
- Responsive design works across all viewport sizes
- RetroUI design consistency maintained throughout

### ✅ Functionality Complete When:
- Users can input text prompts successfully
- Images generate using Gemini 2.5 Flash Image Preview
- Generated images display with proper scaling and styling
- Loading states and error handling work correctly

### ✅ Testing Complete When:
- All quickstart scenarios pass
- Responsive design validated across devices
- Error scenarios handled gracefully
- Build and type checking pass without issues

## Troubleshooting Common Issues

### API Key Issues
- Verify GOOGLE_AI_API_KEY in .env.local file
- Check API key has Gemini 2.5 Flash access enabled
- Ensure environment variables restart with dev server
- Confirm API key not exposed in client-side code

### RetroUI Styling Issues
- Check Tailwind CSS compilation includes RetroUI classes
- Verify class-variance-authority working correctly
- Ensure @/lib/utils cn function available
- Check Radix UI Slot component imported properly

### Image Generation Issues
- Verify Google AI model name exactly matches API
- Check request/response format matches OpenAPI spec
- Ensure proper error handling for API failures
- Test with various prompt lengths and complexity

### Responsive Design Issues
- Test breakpoints: 320px, 640px, 1024px, 1920px
- Verify image scaling preserves aspect ratios
- Check touch target sizes on mobile (44px minimum)
- Ensure text remains readable at all sizes