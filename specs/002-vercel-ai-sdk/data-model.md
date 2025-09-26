# Data Model: Vercel AI SDK Integration

## Core Entities

### ChatMessage
**Purpose**: Represents a single message in a conversation between user and AI
**Fields**:
- `id`: string - Unique identifier for the message
- `role`: 'user' | 'assistant' | 'system' - Message sender type
- `content`: string - The text content of the message
- `createdAt`: Date - Timestamp when message was created

**Relationships**: Part of a conversation thread, sequential order

**Validation Rules**:
- `id` must be non-empty string
- `role` must be one of the specified enum values
- `content` must be non-empty string for user/assistant messages
- `createdAt` must be valid Date object

### AIProvider
**Purpose**: Configuration for different AI service providers
**Fields**:
- `name`: 'openai' | 'anthropic' | 'google' - Provider identifier
- `model`: string - Specific model to use (e.g., 'gpt-4', 'claude-3-sonnet')
- `apiKey`: string - Authentication key for the provider
- `maxTokens`: number - Optional token limit for responses

**Relationships**: Used by streaming responses to determine which AI service to call

**Validation Rules**:
- `name` must be supported provider
- `model` must be valid model name for the provider
- `apiKey` must be non-empty string
- `maxTokens` must be positive integer if specified

### StreamingResponse
**Purpose**: Represents a real-time AI response being generated
**Fields**:
- `id`: string - Unique identifier for the response
- `partial`: string - Current partial content received
- `isComplete`: boolean - Whether response is fully received
- `error`: string | null - Error message if generation failed

**State Transitions**:
- Initial: `partial=""`, `isComplete=false`, `error=null`
- Streaming: `partial` grows with each chunk, `isComplete=false`
- Complete: `partial` contains full response, `isComplete=true`
- Error: `error` contains message, `isComplete=true`

**Validation Rules**:
- `id` must be non-empty string
- `partial` can be empty string initially
- `isComplete` defaults to false
- `error` is null unless error occurs

### ConversationState
**Purpose**: Manages the overall state of a chat conversation
**Fields**:
- `messages`: ChatMessage[] - Array of all messages in conversation
- `isLoading`: boolean - Whether AI is currently generating response
- `currentProvider`: AIProvider - Which AI provider is active
- `error`: string | null - Last error that occurred

**Relationships**: Contains multiple ChatMessage entities, uses one AIProvider

**Validation Rules**:
- `messages` must be valid array of ChatMessage entities
- `isLoading` defaults to false
- `currentProvider` must be valid AIProvider configuration
- `error` is null unless error state active

## Type Definitions

### Message Interface
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}
```

### Provider Configuration
```typescript
interface AIProvider {
  name: 'openai' | 'anthropic' | 'google';
  model: string;
  apiKey: string;
  maxTokens?: number;
}
```

### API Request/Response Types
```typescript
interface ChatRequest {
  messages: ChatMessage[];
  provider: string;
  model?: string;
}

interface StreamingChunk {
  id: string;
  content: string;
  isComplete: boolean;
  error?: string;
}
```