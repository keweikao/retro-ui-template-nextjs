# Tasks: Google AI Image Generation Interface

**Input**: Design documents from `/Users/stephen/Desktop/retro-ui-template-nextjs/specs/003-google-api-key/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/

## Phase 3.1: Setup
- [ ] T001 Install Google AI SDK package using `pnpm add @ai-sdk/google`
- [ ] T002 [P] Configure Google AI API key in .env.local file (GOOGLE_AI_API_KEY)
- [ ] T003 [P] Verify RetroUI components are properly installed and accessible
- [ ] T004 [P] Set up TypeScript interfaces for image generation in lib/types/image-generation.ts

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T005 [P] API route test for /api/generate-image in __tests__/api/generate-image.test.ts
- [ ] T006 [P] ImageGenerator component test in __tests__/components/ImageGenerator.test.tsx
- [ ] T007 [P] Integration test for complete image generation flow in __tests__/integration/image-generation.test.ts
- [ ] T008 [P] Responsive design test for mobile/desktop layouts in __tests__/ui/responsive-image-generator.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T009 [P] Create TypeScript interfaces in lib/types/image-generation.ts
- [ ] T010 [P] Create Zod validation schemas in lib/schemas/image-generation.ts
- [ ] T011 Implement Google AI image generation API route in app/api/generate-image/route.ts
- [ ] T012 Create ImageGenerator component with RetroUI styling in components/ImageGenerator.tsx
- [ ] T013 Create custom hooks for image generation state in hooks/useImageGeneration.ts
- [ ] T014 Integrate ImageGenerator component into homepage in app/page.tsx

## Phase 3.4: Integration & Styling
- [ ] T015 Implement responsive design with Tailwind breakpoints in ImageGenerator component
- [ ] T016 Add RetroUI consistent error handling and loading states
- [ ] T017 Implement image display with Next.js Image component and proper optimization
- [ ] T018 [P] Add input validation and user feedback for prompts
- [ ] T019 [P] Implement proper error boundaries and fallback UI

## Phase 3.5: Polish & Validation
- [ ] T020 [P] Add comprehensive error handling for Google AI API failures
- [ ] T021 [P] Optimize image display performance and caching
- [ ] T022 [P] Add accessibility features (ARIA labels, keyboard navigation)
- [ ] T023 Validate responsive design across all viewport sizes (320px-1920px)
- [ ] T024 Run build and type checking with `pnpm build` and `pnpm type-check`
- [ ] T025 [P] Test RetroUI design consistency with existing components
- [ ] T026 [P] Performance testing for image generation and UI responsiveness

## Dependencies
- Tests (T005-T008) before implementation (T009-T014)
- T009, T010 before T011 (API route needs types and schemas)
- T011 before T012 (component needs working API)
- T012 before T013, T014 (hooks and integration need component)
- T015-T019 after core implementation complete
- T020-T026 (polish) after integration complete

## Parallel Example
```bash
# Launch T005-T008 together:
Task: "Create API route test for /api/generate-image endpoint testing Google AI integration and error handling"
Task: "Create ImageGenerator component test with RetroUI Button and responsive design validation"
Task: "Create integration test for complete user flow from prompt input to image display"
Task: "Create responsive design test ensuring mobile-first approach and proper breakpoints"
```

## File Structure
```
app/
├── api/generate-image/
│   └── route.ts                    # T011
├── page.tsx                        # T014 (homepage integration)

components/
└── ImageGenerator.tsx              # T012

lib/
├── types/image-generation.ts       # T009
└── schemas/image-generation.ts     # T010

hooks/
└── useImageGeneration.ts           # T013

__tests__/
├── api/generate-image.test.ts      # T005
├── components/ImageGenerator.test.tsx  # T006
├── integration/image-generation.test.ts # T007
└── ui/responsive-image-generator.test.tsx # T008
```

## RetroUI Design Requirements
- Use consistent yellow primary color (#ffdb33) for generate button
- Implement black borders (2px) and shadow effects with hover animations
- Maintain responsive design with mobile-first approach
- Ensure design consistency with existing RetroUI components
- Follow Geist Sans typography and spacing conventions

## API Integration Details
- Endpoint: `/api/generate-image` (POST)
- Model: `gemini-2.5-flash-image-preview`
- Request: `{ prompt: string, model?: string }`
- Response: `{ success: boolean, imageUrl?: string, error?: string, requestId: string }`
- Environment: `GOOGLE_AI_API_KEY` required server-side only

## Testing Requirements
- Unit tests for all components and hooks
- Integration tests for API routes with mocked Google AI responses
- Responsive design tests across breakpoints
- Error handling tests for network failures and API errors
- Performance tests for image generation and UI responsiveness

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each completed task
- Maintain RetroUI design consistency throughout
- Ensure mobile-first responsive design approach