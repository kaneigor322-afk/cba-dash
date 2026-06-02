# CBA Events Dashboard

Internal dashboard for tracking mobile app build status across CBA events.

## Stack

- **Frontend** — React 18, Vite, Tailwind CSS 4, Radix UI, Motion
- **Backend** — Express, SQLite (better-sqlite3)

## Development

```bash
npm install

# Terminal 1 — API server (port 3000, seeds DB on first run)
node server.js

# Terminal 2 — Vite dev server (port 5173, proxies /api → 3000)
npm run dev
```

## Production

```bash
npm run build   # compiles frontend → dist/
npm start       # serves API + frontend on port 3000
```

The database (`data.db`) is created automatically on first run.
To reset it, delete the file and restart the server.
