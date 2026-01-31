Backend: NestJS (clean architecture, testing, DI, migrations friendly)

Frontend: React + Vite

State: Redux Toolkit + RTK Query

DB:

Supabase (Postgres = source of truth)

MongoDB (backup / snapshots / raw narration archive)

Auth: Supabase Auth (JWT → API)

AI Provider: Google Gemini (gemini-flash-latest for MVP, scalable to Pro)

API: Pure backend, frontend never touches DB

Testing:

Backend: Jest

Frontend: Vitest

Infra ready: env-based, mobile-ready APIs

Styling: ShadCN UI components, TailwindCSS, centralised CSS
Modularity: Keep components for each thing, and keep files seperate for each component, make small components for each thing , dont make huge files 

