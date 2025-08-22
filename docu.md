# Project File Structure Reference

This document provides a fine-grained, file-level overview of the **chatbot-ui** codebase. It explains the purpose and key responsibilities of each directory and important files.

---

## Root Files

- **README.md**: Project introduction, setup instructions, and usage examples.
- **deepdocs.yml**: Configuration for DeepDocs-based documentation generation.
- **tsconfig.json** & **.eslintrc.json** & **prettier.config.cjs**: TypeScript, ESLint, and Prettier configurations.
- **package.json** & **package-lock.json**: Project dependencies and scripts.
- **next.config.js** & **tailwind.config.ts** & **postcss.config.js**: Next.js and Tailwind CSS configurations.
- **.env.local.example**: Template for local environment variables.

---

## .github/

- **funding.yaml**: Defines GitHub Sponsors funding links for the repository.

## .husky/

- **pre-commit**: Husky pre-commit hook to run linting and tests before each commit.

## __tests__/

- **lib/openapi-conversion.test.ts**: Unit tests for the OpenAPI conversion utility.
- **playwright-test/**: Contains Playwright end-to-end tests: 
  - `tests/login.spec.ts`: Tests login workflows.
  - Configuration and lock files for Playwright.

---

## app/

This directory holds all Next.js **app routes** (layouts, pages, and API routes).

### app/[locale]/
  - **layout.tsx**, **globals.css**, **loading.tsx**: Locale-aware layouts and styles.
  - **page.tsx**: Entry point for each locale’s homepage.
  - **help/page.tsx**: Placeholder help page under construction.
  - **login/**, **setup/**: Authentication and onboarding pages.
  - **[workspaceid]/chat/[chatid]**, **help**, **login/password**, **setup**: Nested workspace and chat pages.

### app/api/
  - **assistants/**, **chat/**, **command/**, **keys/**, **retrieval/**, **username/**: API routes implementing assistant operations, chat integrations (OpenAI, Anthropic, etc.), retrieval pipelines (docx, JSON), command handling, and user key management.

---

## components/

Reusable UI and feature components grouped by purpose:

- **chat/**: Chat UI pieces (message list, input, settings, file display, retrieval settings).
- **ui/**: Design system primitives (buttons, dialogs, sheets, forms, toasts, sliders, menus).
- **sidebar/**: Components for the navigation sidebar, including item renderers and create/update/delete dialogs.
- **setup/**: Components for user onboarding steps (API key, profile, finalization).
- **workspace/**: Workspace management components (assign, delete, settings).
- **icons/**, **models/**, **messages/**: Icon wrappers, model selectors, and message renderers.
- **utility/**: Global utilities (alerts, canvas drawing, import/export, theme switching).

---

## context/

- **context.tsx**: React context provider for sharing application state (user, workspaces, chats, models, etc.) across components.

---

## db/

Database access layers interacting with Supabase tables or storage buckets:

- **assistant-images.ts**, **files.ts**, **message-images.ts**, **profile-images.ts**, **workspace-images.ts**: Storage utilities for images.
- **assistant-collections.ts**, **assistant-files.ts**, **assistant-tools.ts**, **assistants.ts**, **chats.ts**, **collections.ts**, **files.ts**, **folders.ts**, **message-file-items.ts**, **messages.ts**, **models.ts**, **presets.ts**, **prompts.ts**, **tools.ts**, **workspaces.ts**: CRUD functions for application entities.

---

## lib/

Helper modules and utilities:

- **hooks/**: Custom React hooks (clipboard, hotkeys).
- **models/**: Static lists of supported LLM providers.
- **retrieval/processing/**: Document processing functions (CSV, PDF, DOCX, etc.).
- **supabase/**: Supabase client setup and middleware.
- **chat-setting-limits.ts**, **consume-stream.ts**, **envs.ts**, **i18n.ts**, **openapi-conversion.ts**, **utils.ts**: Core logic for streaming, environment handling, internationalization, and API spec conversion.

---

## public/

- **locales/**: Translation JSON files for supported languages.
- **providers/**: Logos for model providers.
- **readme/screenshot.png**, **favicon.ico**, **manifest.json**, **branding icons**: Public assets.

---

## supabase/

- **migrations/**: SQL migration scripts for setting up and evolving database schema.
- **config.toml**, **seed.sql**, **types.ts**: Supabase CLI configuration, seed data, and TypeScript table definitions.

---

## types/

TypeScript type definitions for application data models:

- **images/**: Data shapes for assistant, message, and workspace images.
- **announcement.ts**, **chat.ts**, **collection-file.ts**, **error-response.ts**, **sidebar-data.ts**, etc.: Entity and UI type definitions.

---

## worker/

- **index.js**: Service worker for PWA support and background caching.
