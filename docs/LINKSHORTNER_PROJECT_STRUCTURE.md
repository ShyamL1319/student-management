# Project Structure

The LinkShortner repository employs a unified full-stack architecture orchestrated by the Next.js App Router. The repository does not strictly separate "backend" and "frontend" into different repositories or root folders, but rather organizes them domain-centrically across shared directories.

## Frontend Folder Structure

The frontend leverages React 19, Server Components, Client Components, and Tailwind CSS. The primary UI logic and pages are organized as follows:

*   **`app/`**: The core of the Next.js App Router containing route definitions and pages.
    *   **`app/dashboard/`**: Contains the dashboard user interface and logic.
        *   `page.tsx` & `loading.tsx`: Core views for the dashboard component tree.
        *   `actions.tsx` & `action-utils.ts`: Next.js Server Actions tied specifically to the dashboard UI.
        *   `*-dialog.tsx`: Modals for creating, editing, and deleting links.
    *   **`app/l/[shortcode]/`**: Dynamic route designed for handling the redirection of shortcodes.
*   **`components/`**: Reusable React components.
    *   **`components/ui/`**: A collection of isolated, stateless design system components generated mostly by shadcn/ui (e.g., `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `label.tsx`).
*   **`public/`**: Static assets like images or favicon files served directly by the web server.

## Backend Folder Structure

Backend logic is woven directly into the Next.js architecture via Server Actions, API routes, and independent service libraries.

*   **`app/api/`**: The home for standard RESTful/Serverless endpoint routes.
    *   **`app/api/chat/route.ts`**: The API route responsible for handling AI interactions between the frontend and the underlying language models.
*   **`lib/`**: Contains core business logic, utility functions, and third-party provider integrations.
    *   **`lib/assistant/`**: Core logic for the AI link assistant.
        *   `types.ts`: Shared Zod schema and TypeScript interfaces.
        *   **`providers/`**: Implementations for multiple AI backend targets (`gemini.provider.ts`, `openai.provider.ts`).
    *   **`lib/open-api/`**: Specifications and prompt definitions for LLM integrations (e.g., `link-assistant.ts`).
*   **`db/`**: Isolates all database access concerns and definitions.
    *   `schema.ts`: Defines Drizzle ORM table definitions (e.g., `links` table).
    *   `index.ts`: Establishes the Neon serverless PostgreSQL connection pool.
*   **`drizzle/`**: Output directory for migration artifacts and SQL generation maintained by Drizzle-kit.
