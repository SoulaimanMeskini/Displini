# Agents

## Cursor Cloud specific instructions

### Architecture

Displini is a single full-stack app (not a monorepo). One Express server on port 4000 serves both API routes and the Vite dev middleware (React frontend). See `README.md` for full project structure and scripts.

### Key scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server (port 4000) |
| `npm run build` | Production build (Vite + esbuild) |
| `npm run check` | TypeScript type-check (pre-existing errors in the codebase) |
| `npm run db:push` | Push Drizzle schema to PostgreSQL |

### Database: local PostgreSQL with Neon WebSocket proxy

The codebase uses `@neondatabase/serverless` which connects to PostgreSQL **over WebSockets**, not TCP. A local PostgreSQL instance requires a WSS-to-TCP proxy.

**Startup sequence (every session):**

1. Start PostgreSQL: `sudo pg_ctlcluster 16 main start`
2. Start WebSocket proxy: `sudo $(which node) /tmp/neon-ws-proxy.cjs &>/tmp/ws-proxy.log &`
   - This runs on port 443 (wss://localhost) and forwards to PostgreSQL on port 5432
   - The proxy script is at `/tmp/neon-ws-proxy.cjs` and requires `ws` from `node_modules`
3. Start dev server: `NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev`
   - `NODE_TLS_REJECT_UNAUTHORIZED=0` is needed because the WSS proxy uses a self-signed cert

**Database credentials:** user=`displini`, password=`displini123`, database=`displini` on `localhost:5432`. The `.env` file at the project root contains `DATABASE_URL`.

**pg_hba.conf** is configured to use `password` auth (not `scram-sha-256`) because the Neon driver uses pipelined password authentication.

### Authentication

Auth is stubbed in development: `useAuth()` (client) always returns `isAuthenticated: true`, and the server routes hardcode `userId = "dev-user"`. The dev-user must exist in the `users` table.

### Environment variables

- `DATABASE_URL` (required): PostgreSQL connection string
- `OPENAI_API_KEY` (optional): enables AI features; the app works fine without it
- `SESSION_SECRET`: session encryption key (any string for local dev)
- `NODE_ENV`: set to `development` for Vite dev middleware

### Notes

- The `npm run check` (tsc) has **pre-existing type errors** in the codebase; this is not caused by environment setup.
- The frontend Vite dev server is embedded in the Express server via middleware, not a separate process.
- Docker is installed and available for any containerized services.
