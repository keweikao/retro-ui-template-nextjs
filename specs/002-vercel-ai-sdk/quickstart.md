# Quickstart: Vercel AI SDK Integration

## Prerequisites
- Next.js project with App Router
- pnpm package manager
- AI provider API keys (OpenAI, Anthropic, or Google)

## Installation Test Scenarios

### Scenario 1: Package Installation
```bash
# Test: Install AI SDK packages
pnpm add ai @ai-sdk/react @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google zod

# Expected: All packages installed without conflicts
# Verify: Check package.json contains all dependencies
```

### Scenario 2: Environment Configuration
```bash
# Test: Create .env.local with API keys
cp .env.example .env.local
# Add: OPENAI_API_KEY=your_openai_key
# Add: ANTHROPIC_API_KEY=your_anthropic_key
# Add: GOOGLE_API_KEY=your_google_key

# Expected: Environment variables loaded in development
# Verify: process.env.OPENAI_API_KEY available in API routes
```

### Scenario 3: Basic API Route Test
```typescript
// Test: Create /app/api/chat/route.ts with basic text generation
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST() {
  const { text } = await generateText({
    model: openai('gpt-4'),
    prompt: 'Hello world test',
  });
  return Response.json({ message: text });
}

// Expected: API responds with generated text
// Verify: curl -X POST /api/chat returns JSON response
```

### Scenario 4: Streaming Response Test
```typescript
// Test: Implement streaming API route
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4'),
    messages,
  });

  return result.toUIMessageStreamResponse();
}

// Expected: Streaming response with real-time chunks
// Verify: Response arrives progressively, not all at once
```

### Scenario 5: React Chat Interface Test
```tsx
// Test: Create basic chat component with useChat hook
'use client';

import { useChat } from '@ai-sdk/react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div>
      <div>
        {messages.map(message => (
          <div key={message.id}>
            {message.role}: {message.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

// Expected: Interactive chat interface with message history
// Verify: Messages appear in real-time, form submits properly
```

## Integration Validation Steps

### Step 1: Development Server
```bash
pnpm dev
# Expected: Server starts without errors
# Verify: http://localhost:3000 loads successfully
```

### Step 2: Type Checking
```bash
pnpm type-check
# Expected: No TypeScript errors
# Verify: All AI SDK types resolve correctly
```

### Step 3: Build Test
```bash
pnpm build
# Expected: Production build succeeds
# Verify: No build errors, optimized bundle created
```

### Step 4: API Endpoint Test
```bash
# Test API endpoint manually
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"id":"1","role":"user","content":"Hello"}]}'

# Expected: Streaming response or JSON response
# Verify: No 500 errors, valid response format
```

### Step 5: Error Handling Test
```bash
# Test with missing API key
unset OPENAI_API_KEY
pnpm dev
# Navigate to chat page and send message

# Expected: Graceful error message, no crashes
# Verify: User sees "API key required" or similar message
```

### Step 6: Provider Switching Test
```typescript
// Test multiple AI providers
const providers = ['openai', 'anthropic', 'google'];
for (const provider of providers) {
  // Send same message to each provider
  // Verify responses from all providers
}

# Expected: All configured providers respond
# Verify: Different response styles from each provider
```

## Success Criteria

### ✅ Installation Complete When:
- All AI SDK packages installed via pnpm
- No dependency conflicts or peer dependency warnings
- TypeScript types resolve without errors

### ✅ Configuration Complete When:
- Environment variables loaded and accessible
- API keys validated with provider services
- Development server starts without configuration errors

### ✅ Integration Complete When:
- API routes respond to chat requests
- Streaming responses work in real-time
- React components render chat interface properly
- Error handling works for API failures

### ✅ Testing Complete When:
- All quickstart scenarios pass
- Build process completes successfully
- Manual testing confirms chat functionality
- Error states handled gracefully

## Troubleshooting Common Issues

### API Key Issues
- Verify .env.local file exists and contains keys
- Check API key format and validity
- Ensure environment variables restart with dev server

### Streaming Issues
- Confirm API route uses toUIMessageStreamResponse()
- Check client component uses useChat hook correctly
- Verify network tab shows streaming response

### TypeScript Issues
- Run pnpm type-check for specific errors
- Check import statements for AI SDK packages
- Ensure proper type annotations for messages