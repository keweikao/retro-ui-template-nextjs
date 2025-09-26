# Data Model: Google AI Image Generation Interface

## Core Entities

### ImageGenerationRequest
**Purpose**: Represents a user's request to generate an AI image
**Fields**:
- `id`: string - Unique identifier for the request
- `prompt`: string - User-provided text description for image generation
- `timestamp`: Date - When the request was initiated
- `status`: 'pending' | 'generating' | 'completed' | 'error' - Current request state
- `model`: string - AI model used (default: 'gemini-2.5-flash-image-preview')

**Relationships**: One-to-one with GeneratedImage on successful completion

**Validation Rules**:
- `id` must be non-empty string (UUID format preferred)
- `prompt` must be non-empty string, max 1000 characters
- `timestamp` must be valid Date object
- `status` must be one of the specified enum values
- `model` must be supported Google AI model name

### GeneratedImage
**Purpose**: Represents an AI-generated image with metadata
**Fields**:
- `id`: string - Unique identifier for the generated image
- `requestId`: string - Reference to the original ImageGenerationRequest
- `imageUrl`: string - URL/base64 data of the generated image
- `prompt`: string - Original prompt used for generation
- `generatedAt`: Date - Timestamp when image was successfully generated
- `dimensions`: { width: number, height: number } - Image dimensions
- `fileSize`: number - Image file size in bytes (if available)

**Relationships**: Belongs to one ImageGenerationRequest

**Validation Rules**:
- `id` must be non-empty string
- `requestId` must match existing ImageGenerationRequest
- `imageUrl` must be valid URL or base64 data string
- `prompt` must match original request prompt
- `generatedAt` must be valid Date object
- `dimensions` width and height must be positive numbers
- `fileSize` must be non-negative number if provided

### UIState
**Purpose**: Manages the user interface state during image generation
**Fields**:
- `isLoading`: boolean - Whether generation is in progress
- `error`: string | null - Error message if generation failed
- `currentRequest`: ImageGenerationRequest | null - Active generation request
- `generatedImage`: GeneratedImage | null - Most recently generated image
- `inputValue`: string - Current value in the prompt input field

**State Transitions**:
- Initial: `isLoading=false`, `error=null`, `currentRequest=null`, `generatedImage=null`
- Generating: `isLoading=true`, `currentRequest` set, `error=null`
- Success: `isLoading=false`, `generatedImage` set, `error=null`
- Error: `isLoading=false`, `error` set, `currentRequest=null`

**Validation Rules**:
- `isLoading` defaults to false
- `error` is null unless error state active
- `currentRequest` is null when not generating
- `generatedImage` persists until new generation starts
- `inputValue` can be empty string

### APIConfiguration
**Purpose**: Configuration for Google AI API integration
**Fields**:
- `apiKey`: string - Google AI API authentication key
- `model`: string - Default model to use for image generation
- `endpoint`: string - Google AI API endpoint URL
- `timeout`: number - Request timeout in milliseconds
- `maxRetries`: number - Maximum retry attempts for failed requests

**Relationships**: Used by all ImageGenerationRequest operations

**Validation Rules**:
- `apiKey` must be non-empty string (server-side only)
- `model` must be valid Google AI model identifier
- `endpoint` must be valid URL
- `timeout` must be positive number (default: 30000ms)
- `maxRetries` must be non-negative integer (default: 3)

### ResponsiveLayout
**Purpose**: Manages responsive design state and breakpoints
**Fields**:
- `viewport`: 'mobile' | 'tablet' | 'desktop' - Current viewport category
- `screenWidth`: number - Current screen width in pixels
- `imageDisplayMode`: 'stacked' | 'side-by-side' - Layout mode for image display
- `inputWidth`: 'full' | 'constrained' - Input field width setting

**Validation Rules**:
- `viewport` determined by screen width breakpoints
- `screenWidth` must be positive number
- `imageDisplayMode` depends on viewport size
- `inputWidth` adapts to viewport and layout constraints

## Type Definitions

### Request Interface
```typescript
interface ImageGenerationRequest {
  id: string;
  prompt: string;
  timestamp: Date;
  status: 'pending' | 'generating' | 'completed' | 'error';
  model: string;
}
```

### Response Interface
```typescript
interface GeneratedImage {
  id: string;
  requestId: string;
  imageUrl: string;
  prompt: string;
  generatedAt: Date;
  dimensions: {
    width: number;
    height: number;
  };
  fileSize?: number;
}
```

### API Request/Response Types
```typescript
interface ImageGenerationAPIRequest {
  prompt: string;
  model?: string;
}

interface ImageGenerationAPIResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  requestId: string;
  generatedAt: Date;
  dimensions?: {
    width: number;
    height: number;
  };
}
```

### UI State Interface
```typescript
interface ImageGeneratorUIState {
  isLoading: boolean;
  error: string | null;
  currentRequest: ImageGenerationRequest | null;
  generatedImage: GeneratedImage | null;
  inputValue: string;
}
```