# GitHub Developer Discovery Platform

Monorepo for discovering GitHub developers by location and public profile filters.

## Project Structure

```
contact/
├── backend/    # Node.js + Express API
└── frontend/   # React 19 + TypeScript dashboard
```

## Quick Start

**Terminal 1 — Backend:**

```bash
cd backend
npm install
cp .env.example .env
npm start
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Open **http://127.0.0.1:5173** — the frontend proxies API requests to `http://localhost:3000`.

> If you see `ERR_CONNECTION_REFUSED`, stop old dev servers first:
> ```bash
> # Windows — free ports 3000 and 5173, then restart
> npm run dev:backend
> npm run dev:frontend
> ```

## Docs

- [Backend README](./backend/README.md) — API, env vars, GitHub integration
- [Frontend](./frontend/) — React SaaS dashboard (see `frontend/package.json` scripts)

## License

MIT

# git-contact
