# SafeGuard Navigators - SafeRoute Project

## Project Overview

This is a Next.js 15+ project for **SafeRoute**, an AI-driven public safety navigation system. It's designed to prioritize pedestrian and two-wheeler safety in Indian urban contexts by providing safety-first routing, integrating environmental data (like lighting), crowdsourced hazard reporting, and civic infrastructure feedback.

Key features include:
- Multi-factor SafetyScore calculation (lighting, footfall, hazards, proximity to help).
- Trust-weighted crowdsourcing for real-time hazard data.
- Integration with VIIRS satellite data and municipal "dark-spot" inventories.
- English language interface with modular, scalable architecture for future internationalization.
- Compliance with India's DPDP Act 2023 for data privacy.
- Offline capabilities and accessibility focus.

The application aims to reduce exposure to unsafe routes and empower users with informed, safety-aware navigation choices.

## Technology Stack

- **Frontend:** Next.js 15+, React 19, TypeScript, Tailwind CSS v4+, Shadcn UI, Magic UI, Framer Motion
- **Backend Services:** FastAPI (Python), NestJS (TypeScript) for microservices
- **Maps & Visualization:** Mappls SDK, MapLibre GL, OpenStreetMap
- **Database & Geospatial:** PostgreSQL + PostGIS, Neo4j
- **Routing Engine:** OSRM, GraphHopper
- **Machine Learning:** XGBoost/LightGBM, PyTorch
- **Real-time Processing:** Kafka/RabbitMQ
- **Authentication & Authorization:** Custom implementation with `iron-session` and `jose` (JWT)
- **Deployment:** Vercel (implied by Next.js setup)

## Building and Running

This project uses standard Next.js scripts. Ensure you have Node.js and npm/yarn/pnpm/bun installed.

1.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```
    *Note: The `postinstall` script runs `prisma generate`.*

2.  **Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```
    This starts the development server using Turbopack, typically accessible at `http://localhost:3000`.

3.  **Build for Production:**
    ```bash
    npm run build
    # or
    yarn build
    # or
    pnpm build
    # or
    bun build
    ```
    This creates an optimized production build.

4.  **Start Production Server:**
    ```bash
    npm run start
    # or
    yarn start
    # or
    pnpm start
    # or
    bun start
    ```
    This starts the production server. (Requires a build first).

5.  **Linting:**
    ```bash
    npm run lint
    # or
    yarn lint
    # or
    pnpm lint
    # or
    bun lint
    ```
    Runs ESLint for code quality checks.

## Development Conventions

- **Framework:** Next.js App Router with React Server Components.
- **Styling:** Tailwind CSS with utility-first approach. Shadcn UI components are used for common UI elements.
- **Internationalization:** Removed for current version - English only interface with modular architecture for future multi-language support.
- **File Structure:**
  - `app/`: Contains application routes, layouts, and pages using the App Router.
  - `components/`: Reusable UI components.
  - `context/`: React Context providers (e.g., `AuthContext`).
  - `hooks/`: Custom React hooks.
  - `lib/`: Utility functions and shared logic.
  - `prisma/`: Prisma schema and migrations.
  - `public/`: Static assets.
- **Authentication:** A custom authentication context (`AuthContext`) is implemented in `context/AuthContext.tsx`, interacting with backend APIs at `/api/auth/*`.
- **Data Fetching:** Utilizes `fetch` API for client-side requests. Server-side data fetching likely occurs within API routes or Server Components.
- **Testing:** Jest and Testing Library are listed as dev dependencies, suggesting a testing strategy is in place, though specific conventions weren't detailed in the reviewed files.
- **Code Quality:** ESLint and Prettier are configured for linting and formatting.