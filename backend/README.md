# GitHub User Discovery — Backend

Node.js API that searches GitHub users by location and social filters, then returns structured public contact signals.

## Quick Start

```bash
npm install
cp .env.example .env   # add GITHUB_TOKEN
npm start
```

Development mode with auto-reload:

```bash
npm run dev
```

Server runs at `http://localhost:3000`.

## API

### `POST /search-users`

```json
{
  "country": "United States",
  "stack": "frontend",
  "skill": "TypeScript",
  "role": "engineer",
  "tech": "React",
  "company": "Acme",
  "query": "seattle",
  "maxFollowers": 500,
  "maxRepos": 100,
  "type": "user",
  "limit": 24,
  "page": 1
}
```

Optional text filters are mapped like GitHub user search:

- `skill` / `tech` → `language:` when recognized (e.g. TypeScript, Go); otherwise free-text keywords
- `role` / `company` / `query` → free-text keywords
- `stack` → keyword clause (`frontend` | `backend` | `fullstack` | `devops`)

Example `q`: `location:"United States" type:user language:TypeScript React engineer "Acme"`

**Emails:** when a profile has no public email, the API probes recent commits and reads `From: Name <email>` from `https://github.com/{owner}/{repo}/commit/{sha}.patch`.

**Infinite scroll:** request `page: 1`, then increment while `hasMore` is `true` (or use `nextPage`).

```json
{
  "count": 20,
  "totalCount": 8432,
  "page": 1,
  "perPage": 20,
  "hasMore": true,
  "nextPage": 2,
  "users": []
}
```

### `POST /lookup-user`

Find a single user by public email or GitHub username.

```json
{ "email": "user@gmail.com" }
```

Response includes `user` profile and `projects` (repository links).

### `GET /health`

Returns server status and whether a GitHub token is configured.

## Project Structure

```
src/
├── app.js
├── controllers/
├── routes/
├── services/
└── utils/
```

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `GITHUB_TOKEN` | — | GitHub PAT for higher rate limits |
| `PORT` | `3000` | Server port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin |
| `CACHE_TTL_SECONDS` | `300` | In-memory cache TTL |
