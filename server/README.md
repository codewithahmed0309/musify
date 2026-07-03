# Ahmedify API

Express + TypeScript backend for the Ahmedify music client. Single private
user (no public registration), JWT auth, Supabase as the data store.

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:
- `AUTH_USERNAME` / `AUTH_PASSWORD_HASH` — the one login this app accepts.
  Generate the hash with:
  ```bash
  node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
  ```
- `JWT_SECRET` — any long random string.
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — from your Supabase project
  settings (API tab). **Use the service role key, not the anon key** — this
  server is the only thing that should ever hold it.

Then create the schema:

```bash
# In the Supabase SQL editor, run schema.sql, then optionally seed.sql
```

## Run

```bash
npm run dev     # tsx watch, http://localhost:4000
npm run build   # compile to dist/
npm start        # run compiled output
```

The client's Vite dev server proxies `/api` to `http://localhost:4000` by
default (see `client/vite.config.ts`), so running both `npm run dev` here and
in `client/` at the same time is all you need locally.

## API

All routes are prefixed with `/api`. Everything except `/api/health` and
`/api/auth/login` requires `Authorization: Bearer <token>`.

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Liveness check |
| POST | `/auth/login` | `{ username, password }` → `{ token, expiresAt }` |
| GET | `/songs` | All songs |
| GET | `/artists` | All artists |
| GET | `/albums` | All albums |
| GET | `/playlists` | All playlists |
| GET | `/search?q=` | Fan-out search across all four |
| POST | `/upload` | `multipart/form-data`, field `file` (+ optional `folder`: `covers`\|`audio`) → `{ url }` |

## Project structure

```
src/
  app.ts             Express app assembly (middleware, routes, error handling)
  server.ts           Entry point — starts the HTTP listener
  config/            Env loading, Supabase client
  routes/            Express routers, one per resource
  controllers/       Request/response handling, thin
  services/          Supabase queries + business logic
  middleware/        Auth guard, upload (multer), error handler
  utils/             asyncHandler, AppError, JWT helpers
  types/             Shared types, mirrors client/src/types exactly
```
