# Local Development Setup

## Running API Locally with Vercel CLI

You can test your API endpoints locally without deploying to Vercel! The API will read from your `.env` file.

### Step 1: Install Vercel CLI

```bash
npm install
```

This will install the `vercel` package that's already added to `package.json`.

### Step 2: Run the Local API Server

In one terminal, run:

```bash
npm run dev:api
```

This starts Vercel's local development server on `http://localhost:3000`. The API endpoints will be available at:
- `http://localhost:3000/api/admin/clients`
- `http://localhost:3000/api/admin/appointments`
- etc.

### Step 3: Run the Frontend

In another terminal, run:

```bash
npm run dev
```

This starts Vite on `http://localhost:5173`.

### Step 4: Or Run Both Together

You can run both at the same time:

```bash
npm run dev:all
```

This will start both the frontend (Vite) and the API (Vercel dev) concurrently.

## How It Works

1. **Development Mode**: When `import.meta.env.DEV` is `true` (which it is when running `npm run dev`), the frontend automatically uses `http://localhost:3000` for API calls.

2. **Production Mode**: When deployed, it uses the production API URL from `VITE_API_URL` or the default Vercel URL.

3. **Environment Variables**: Vercel CLI automatically reads your `.env` file, so your Supabase credentials will be available to the API endpoints.

## Important Notes

- Make sure your `.env` file has:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`)

- The database tables must exist in Supabase (run `database-schema.sql`)

- No need to deploy to Vercel for local testing!

## Troubleshooting

**Port already in use?**
- Vercel dev uses port 3000 by default
- If port 3000 is busy, Vercel will ask to use a different port
- Update `vite.config.ts` proxy target if needed

**API not connecting?**
- Make sure `vercel dev` is running
- Check that the port matches (default is 3000)
- Check browser console for errors

**Environment variables not working?**
- Make sure `.env` file is in the root directory
- Restart `vercel dev` after changing `.env`
- Check that variable names match what the API expects

