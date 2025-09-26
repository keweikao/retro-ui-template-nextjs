<!--
Sync Impact Report:
Version change: 1.0.0 → 1.0.1
Modified principles: Enhanced PNPM CLI requirement in Principle I and Dependency Management
Added sections: None
Removed sections: None
Templates requiring updates: ✅ plan-template.md, ✅ spec-template.md, ✅ tasks-template.md
Follow-up TODOs: None
-->

# Retro UI Template Next.js Constitution

## Core Principles

### I. PNPM-Exclusive CLI Operations
All package management and project workflow commands MUST be executed using pnpm exclusively. This includes dependency management, script execution, and all development lifecycle operations (dev, build, lint, type-check, test, start).

**Rationale**: pnpm provides superior dependency management with strict peer dependency resolution, faster installation times, better security through content verification, and ensures consistent execution environment across all development tasks.

### II. CLI-First Development
Every development task MUST be accessible via CLI commands defined in package.json scripts. All build, test, lint, and development operations MUST be scriptable and reproducible across environments.

**Rationale**: CLI-first approach ensures consistent development experience, enables automation, and provides clear documentation of available operations.

### III. Next.js Framework Adherence
Development MUST follow Next.js conventions and best practices. Use App Router, TypeScript, and Turbopack where applicable. All pages and components MUST follow Next.js file-system routing conventions.

**Rationale**: Following framework conventions reduces cognitive overhead, improves maintainability, and leverages community best practices and tooling.

### IV. Modern JavaScript Standards
Code MUST use modern JavaScript/TypeScript features including ES modules, async/await, and proper TypeScript typing. No legacy CommonJS or callback patterns except where required by dependencies.

**Rationale**: Modern standards improve code quality, developer experience, and long-term maintainability.

### V. Component-Driven UI Development
UI components MUST be modular, reusable, and follow single responsibility principle. Use Radix UI primitives and Tailwind CSS for styling. Components MUST be composable and properly typed.

**Rationale**: Component-driven development improves reusability, testability, and maintainability of UI code.

## Dependency Management

All package operations and workflow commands MUST use pnpm exclusively:
- Installing packages: `pnpm add <package>` or `pnpm add -D <package>`
- Removing packages: `pnpm remove <package>`
- Installing all dependencies: `pnpm install`
- Running scripts: `pnpm run <script>` or `pnpm <script>`
- Development workflows: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm start`

Package.json scripts MUST be defined for all common development tasks and MUST work consistently across all environments. Never use npm, yarn, or direct node commands when a pnpm equivalent exists.

## Development Workflow

### Required Scripts
All projects MUST implement these package.json scripts (executed via pnpm):
- `dev`: Start development server with hot reload (`pnpm dev`)
- `build`: Create production build (`pnpm build`)
- `start`: Start production server (`pnpm start`)
- `lint`: Run code linting and formatting checks (`pnpm lint`)
- `type-check`: Run TypeScript type checking (`pnpm type-check`)

### Code Quality
- ESLint MUST be configured and pass on all code
- TypeScript MUST be used for type safety
- All builds MUST complete without errors or warnings
- Code formatting MUST be consistent and automated

## Governance

This constitution supersedes all other development practices and decisions. All pull requests and code reviews MUST verify compliance with these principles.

**Amendment Process**: Constitution changes require documentation of rationale, impact assessment, and updating of dependent templates and documentation.

**Compliance Review**: All feature implementations MUST be evaluated against constitutional principles. Deviations require explicit justification and approval.

**Version**: 1.0.1 | **Ratified**: 2025-09-25 | **Last Amended**: 2025-09-26