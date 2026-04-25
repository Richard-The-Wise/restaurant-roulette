# Restaurant Roulette

Restaurant Roulette is a production-ready MVP built with Next.js App Router, Tailwind CSS, Supabase, and Google Places API. It lets each signed-in user maintain a private list of restaurants, enrich entries from Google Maps, filter and sort their catalog, and spin a polished roulette wheel to decide where to go next.

## Features

- Supabase Auth with private per-user restaurant lists
- Add restaurants from a Google Maps link or direct place ID
- Google Places autofill for name, category, cuisine, opening hours, rating, and price level
- Dashboard with summary metrics, recent additions, favorites, and tag insights
- Catalog with filters for category, cuisine, rating, and price level
- Sorting by most visited, highest rating, and recently added
- Roulette wheel with filters for all places, only unvisited places, and most visited places
- Favorites, tags, notes, visit counts, and last-visited tracking
- Deployment-ready structure for Vercel

## Tech stack

- Next.js App Router with TypeScript
- Tailwind CSS
- Supabase Database + Auth + Row Level Security
- Google Places API (New)
- Framer Motion for roulette animation

## Project structure

```text
.
|-- app
|   |-- (app)
|   |   |-- add
|   |   |   |-- actions.ts
|   |   |   `-- page.tsx
|   |   |-- catalog
|   |   |   |-- actions.ts
|   |   |   `-- page.tsx
|   |   |-- roulette
|   |   |   `-- page.tsx
|   |   |-- layout.tsx
|   |   `-- page.tsx
|   |-- (auth)
|   |   `-- login
|   |       |-- actions.ts
|   |       `-- page.tsx
|   |-- api
|   |   `-- places
|   |       `-- lookup
|   |           `-- route.ts
|   |-- globals.css
|   |-- layout.tsx
|   `-- loading.tsx
|-- components
|-- lib
|   |-- supabase
|   |-- constants.ts
|   |-- google-places.ts
|   `-- utils.ts
|-- supabase
|   `-- schema.sql
|-- types
|-- .env.example
|-- .eslintrc.json
|-- next.config.ts
|-- package.json
|-- postcss.config.mjs
|-- proxy.ts
|-- tailwind.config.ts
`-- tsconfig.json
```

## Environment variables

Create `.env.local` from `.env.example` and populate:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

Notes:

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` follows current Supabase docs for browser-safe client access.
- `SUPABASE_SERVICE_ROLE_KEY` is included for future admin/server-only extensions, but the current app does not expose it to the browser.
- `GOOGLE_PLACES_API_KEY` must have Places API (New) enabled in Google Cloud.

## Supabase setup

1. Create a Supabase project.
2. In Supabase, open the SQL Editor and run [supabase/schema.sql](/C:/Users/rikca/OneDrive/Documentos/New%20project/supabase/schema.sql).
3. In Authentication:
   Set email/password sign-in to enabled.
4. In Project Settings > API:
   Copy the project URL and publishable key into `.env.local`.
5. Optional:
   Enable email confirmation if you want signup verification emails.

The SQL schema creates:

- A `restaurants` table with the requested fields plus `user_id`, `google_place_id`, `google_maps_url`, `is_favorite`, `tags`, and `updated_at`
- Indexes for filtering and tag search
- Row Level Security policies so users can only access their own restaurant list
- An update trigger to keep `updated_at` current

## Google Places setup

1. Open Google Cloud Console.
2. Enable `Places API`.
3. Create an API key.
4. Restrict the key to your app domains and to Places API where possible.
5. Add the key to `.env.local` as `GOOGLE_PLACES_API_KEY`.

The app uses:

- Text Search to resolve a pasted Maps link or free-form place input when no direct place ID is available
- Place Details to fetch restaurant metadata with a field mask for production-friendly usage

## Local development

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open `http://localhost:3000`

## Deploy to Vercel

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Import the project into Vercel.
3. Add all environment variables from `.env.local` into the Vercel project settings.
4. Deploy.

Vercel will automatically run the Next.js build using the standard scripts in `package.json`.

## Product notes

- The middleware refreshes Supabase auth cookies and protects app routes.
- The roulette wheel runs fully client-side and uses the stored Supabase data as its source.
- The add flow allows manual edits after Google autofill so users can correct incomplete source data.
- Price levels are normalized to a 1-5 scale for consistent filtering and display.

## References

This app structure follows current official guidance for Next.js App Router and Supabase SSR auth. Google integration uses Places API (New) with Text Search and Place Details field masks.
