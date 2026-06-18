# Frontend Architecture & Development Rules

These rules apply when developing, modifying, or styling the React frontend.

## Core Technologies
- React, TypeScript, and Vite
- React Router (Routing & Protection)
- React Query (Server-state caching)
- Axios (HTTP client layer)
- Material UI (MUI - theme component library)

## Styling & Design System (Soft UI)
1. **Soft UI Principles**:
   - Rounding: Define `borderRadius` values between `8px` and `12px` to provide soft curves.
   - Borders: Avoid heavy drop-shadows. Use thin, flat borders (`1px solid #e2e8f0`).
2. **Typography**:
   - Use `Outfit` font for bold, modern headings.
   - Use `Inter` font for highly readable body text, buttons, tables, and lists.
3. **Color Palette**:
   - Primary: Indigo/Blue shades (e.g. `#4f46e5`).
   - Secondary: Teal shades (e.g. `#0d9488`).
   - Backgrounds: Neutral, off-white background palettes. Support dark theme alternatives correctly.
4. **Immediate User Feedback**:
   - Display a spinner or loader (e.g. `CircularProgress`) during data fetching or API mutations.
   - Render green toast notifications (Snackbars) on successful save/updates, and red ones on API failures.
   - Avoid empty screen states; display custom illustrations/labels explaining there is no data.

## Coding Patterns
1. **Directory Structure**:
   - Organize files in features (`src/features/*`).
   - Split pages (`src/features/pages/`), UI components (`src/features/components/`), API layer services (`src/features/api/`), and queries (`src/features/hooks/`).
2. **State Management**:
   - Use React Query for handling all server data, mutations, and caching.
   - Do not duplicate server state into React Context or state variables.
3. **Security & Routing**:
   - Secure pages by enclosing them inside a `ProtectedRoute` component in `App.tsx` that checks roles and authentication JWTs.
4. **Client-Side Optimization**:
   - Debounce searching and text input filters.
   - Disable submission controls while forms are submitting.
