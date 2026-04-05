# Cloudflare Worker - GiftOnScreen

Secure gift rendering system for GiftOnScreen.

## Setup Instructions

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

### 3. Set Environment Secrets

```bash
# Supabase credentials
wrangler secret put SUPABASE_URL
# Enter: https://your-project.supabase.co

wrangler secret put SUPABASE_SERVICE_KEY
# Enter: your-service-role-key (NOT anon key)

# GitHub credentials
wrangler secret put GITHUB_TOKEN
# Enter: ghp_xxxxxxxxxxxx (personal access token)

wrangler secret put GITHUB_REPO
# Enter: username/repo-name
```

### 4. Deploy Worker

```bash
wrangler deploy
```

### 5. Configure Routing

In Cloudflare Dashboard:
1. Go to Workers & Pages
2. Select your worker
3. Go to Settings > Triggers
4. Add Custom Domain: `yourdomain.com/g/*`

Or use Routes:
- Pattern: `yourdomain.com/g/*`
- Worker: `giftonscreen-worker`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (bypasses RLS) |
| `GITHUB_TOKEN` | GitHub personal access token |
| `GITHUB_REPO` | Template repo (e.g., `user/templates`) |

## How It Works

1. User visits `/g/GIFT-XXXXX`
2. Worker extracts gift ID
3. Fetches gift from Supabase
4. Validates gift (exists, not expired)
5. Checks status:
   - `inactive` → shows "preparing" page
   - `active` → fetches template from GitHub
6. Injects gift data into template
7. Returns final HTML

## Security Features

- No frontend rendering
- No template URLs exposed
- GitHub token never exposed to client
- Data injection uses JSON.stringify (prevents XSS)
- Service key bypasses RLS for server-side access

## API Endpoints

| Route | Description |
|-------|-------------|
| `GET /g/:giftId` | Render gift page |

## Error Handling

- 404: Gift not found
- 400: Invalid gift ID
- 500: Server error

All errors return HTML pages (not JSON).
