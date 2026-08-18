# Banquet

Monorepo for the Banquet CRM — enquiry, menu selection, bookings, and banquet operations.

| Package | Path | Stack |
|---------|------|--------|
| **API** | [`api/`](./api) | Node.js 22, Fastify, Prisma, PostgreSQL |
| **Web** | [`web/`](./web) | React, Vite, Tailwind, shadcn/ui |

## Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io/) 11.9+
- Docker (optional, for Postgres / full stack)

## Quick start

```sh
# Install all workspace dependencies
pnpm install

# Copy env files
cp api/.env.example api/.env
cp web/.env.example web/.env

# Start Postgres (and optional pgAdmin)
docker compose up -d postgres

# Migrate + seed the database
pnpm prisma:migrate
pnpm prisma:seed

# Run API and web together
pnpm dev
```

- API: http://localhost:3000  
- Web: http://localhost:8080 (or the port Vite prints)  
- Swagger: http://localhost:3000/docs (if enabled)  
- pgAdmin: http://localhost:5050  

## Workspace scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start API + web in parallel |
| `pnpm dev:api` / `pnpm dev:web` | Start one package |
| `pnpm build` | Build both packages |
| `pnpm lint` / `pnpm test` | Lint / test both |
| `pnpm prisma:migrate` | Run Prisma migrations |
| `pnpm prisma:seed` | Seed the database |
| `pnpm docker:up` | `docker compose up -d` |

## Docker (full stack)

```sh
cp api/.env.example api/.env
cp web/.env.example web/.env
docker compose up -d --build
```

This starts Postgres, pgAdmin, the API, and the web app (Vite on http://localhost:8080). Source is mounted, so frontend edits reload without rebuilding. See [`docker-compose.yml`](./docker-compose.yml).

## Repo layout

```
banquet/
├── api/                 # REST API (banquet-crm-api)
├── web/                 # Frontend (banquet-web)
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Theme

Frontend design tokens: [`web/docs/THEME.md`](./web/docs/THEME.md).

## License

UNLICENSED — private project.
