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
  "country": "Japan",
  "minFollowers": 50,
  "minFollowing": 10,
  "minRepos": 20,
  "limit": 20,
  "page": 1
}
```

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
