# AI Personal Shopper Quiz

A small full-stack customer quiz matching the supplied form design.

## Stack

- Frontend: HTML + CSS + vanilla JavaScript
- Backend: Node.js + Express
- Database: Supabase-ready
- API: `POST /api/quiz`

## Run locally

1. Install Node.js.
2. Open this folder in a terminal.
3. Run:

```bash
npm install
npm start
```

4. Open:

`http://localhost:3000`

## Test API

Open:

`http://localhost:3000/api/health`

The response should be:

```json
{
  "ok": true,
  "service": "AI Personal Shopper Quiz API"
}
```

## Form fields

- Name
- Email
- Budget
- Interests / who they are buying for

The frontend validates through the backend and shows success/error feedback without reloading the page.

## Connect Supabase

See `SUPABASE_SETUP.md`.
