# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup
- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize project dependencies using `pnpm install`
- [ ] T003 [P] Configure linting and formatting tools (ESLint, Prettier)
- [ ] T004 [P] Add required package.json scripts per constitution

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T005 [P] Component test for Button in __tests__/components/Button.test.tsx
- [ ] T006 [P] API route test for /api/users in __tests__/api/users.test.ts
- [ ] T007 [P] Integration test for user flow in __tests__/integration/user-flow.test.ts
- [ ] T008 [P] Page test for registration in __tests__/pages/register.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T009 [P] User type definitions in lib/types/user.ts
- [ ] T010 [P] UserService utilities in lib/services/user-service.ts
- [ ] T011 [P] Button component in components/ui/Button.tsx
- [ ] T012 POST /api/users API route in app/api/users/route.ts
- [ ] T013 GET /api/users/[id] API route in app/api/users/[id]/route.ts
- [ ] T014 Registration page in app/register/page.tsx
- [ ] T015 Input validation using Zod schemas
- [ ] T016 Error handling and logging

## Phase 3.4: Integration
- [ ] T017 Connect API routes to database/storage
- [ ] T018 Authentication middleware
- [ ] T019 Request/response logging
- [ ] T020 CORS and security headers in middleware.ts

## Phase 3.5: Polish
- [ ] T021 [P] Unit tests for utility functions in __tests__/lib/utils.test.ts
- [ ] T022 Performance tests using Lighthouse CI
- [ ] T023 [P] Update README.md with new features
- [ ] T024 Remove code duplication and optimize bundle
- [ ] T025 Run build and type checking with `pnpm build`
- [ ] T026 Run linting with `pnpm lint`

## Dependencies
- Tests (T004-T007) before implementation (T008-T014)
- T008 blocks T009, T015
- T016 blocks T018
- Implementation before polish (T019-T023)

## Parallel Example
```
# Launch T004-T007 together:
Task: "Contract test POST /api/users in tests/contract/test_users_post.py"
Task: "Contract test GET /api/users/{id} in tests/contract/test_users_get.py"
Task: "Integration test registration in tests/integration/test_registration.py"
Task: "Integration test auth in tests/integration/test_auth.py"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
   
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
   
3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task