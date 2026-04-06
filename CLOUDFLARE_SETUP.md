# GiftOnScreen - Cloudflare Deployment Guide

Complete guide for deploying GiftOnScreen to Cloudflare (Pages + Workers).

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cloudflare                               │
│  ┌─────────────────┐          ┌─────────────────────────────┐  │
│  │  Cloudflare     │          │   Cloudflare Worker         │  │
│  │  Pages          │          │   (Secure Gift Rendering)   │  │
│  │                 │          │                             │  │
│  │  /              │          │   /g/:giftId                │  │
│  │  /public/*      │          │     ↓                       │  │
│  │  /admin/*       │          │   Fetches from Supabase     │  │
│  │                 │          │   Validates & Renders       │  │
│  └─────────────────┘          └─────────────────────────────┘  │
│           ↓                              ↓                      │
│    Static Assets                  Dynamic Content               │
│    (HTML/CSS/JS)                  (Gift Pages)                  │
└─────────────────────────────────────────────────────────────────┘
                                    ↓
                           ┌─────────────────┐
                           │   Supabase      │
                           │   (Database)    │
                           └─────────────────┘
```

## Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed
- [Supabase project](https://supabase.com) set up
- [Cloudinary account](https://cloudinary.com) (for image uploads)

---

## Step 1: Install Wrangler CLI

```bash
# Install globally
npm install -g wrangler

# Verify installation
wrangler --version
```

---

## Step 2: Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser window to authenticate with your Cloudflare account.

---

## Step 3: Configure Secrets

### For Main Application (Pages)

```bash
# Supabase Configuration
wrangler secret put SUPABASE_URL
# Enter: https://your-project.supabase.co

wrangler secret put SUPABASE_ANON_KEY
# Enter: your-anon-key-from-supabase-settings

# Cloudinary Configuration (for image uploads)
wrangler secret put CLOUDINARY_CLOUD_NAME
# Enter: your-cloudinary-cloud-name

wrangler secret put CLOUDINARY_API_KEY
# Enter: your-cloudinary-api-key

wrangler secret put CLOUDINARY_API_SECRET
# Enter: your-cloudinary-api-secret
```

### For Gift Rendering Worker

Navigate to the worker directory:

```bash
cd worker

# Supabase (Service Role Key - for bypassing RLS)
wrangler secret put SUPABASE_URL
# Enter: https://your-project.supabase.co

wrangler secret put SUPABASE_SERVICE_KEY
# Enter: your-service-role-key (NOT the anon key!)

# GitHub (for private template repository)
wrangler secret put GITHUB_TOKEN
# Enter: ghp_xxxxxxxxxxxx (personal access token with repo access)

wrangler secret put GITHUB_REPO
# Enter: username/repo-name (e.g., "yogee20001/giftonscreen-templates")
```

---

## Step 4: Deploy Gift Rendering Worker

```bash
cd worker

# Deploy the worker
wrangler deploy

# Note the worker URL: https://giftonscreen-worker.your-subdomain.workers.dev
```

---

## Step 5: Deploy Frontend to Cloudflare Pages

### Option A: Deploy via Wrangler

```bash
# From project root
npx wrangler pages deploy . --project-name=giftonscreen8
```

### Option B: Deploy via Git Integration (Recommended)

1. Push your code to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
3. Navigate to **Workers & Pages** → **Create application** → **Pages**
4. Connect your GitHub repository
5. Configure build settings:
   - **Build command:** (leave empty for static site)
   - **Build output directory:** `.`
6. Add environment variables in the dashboard
7. Deploy!

---

## Step 6: Configure Custom Domain (Optional)

### Add Custom Domain to Pages

1. In Cloudflare Dashboard, go to your Pages project
2. Click **Custom domains** tab
3. Click **Set up a custom domain**
4. Enter your domain (e.g., `giftonscreen.com`)
5. Follow the DNS configuration steps

### Configure Worker Route

To make the worker handle `/g/*` routes on your custom domain:

1. Go to **Workers & Pages** → Select your worker
2. Click **Settings** → **Triggers**
3. Under **Custom Domains**, click **Add Custom Domain**
4. Enter: `giftonscreen.com/g/*`

Or use Routes:
1. Go to your domain in Cloudflare Dashboard
2. Go to **Workers Routes**
3. Add route:
   - **Route:** `giftonscreen.com/g/*`
   - **Service:** `giftonscreen-worker`

---

## Step 7: Update Supabase Configuration

### Add Site URL to Supabase Auth

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Cloudflare Pages URL to:
   - **Site URL:** `https://giftonscreen.pages.dev`
   - **Redirect URLs:** Add both:
     - `https://giftonscreen.pages.dev/public/callback.html`
     - `https://your-custom-domain.com/public/callback.html` (if using custom domain)

### Update CORS Settings

If needed, add your domain to CORS allowed origins in Supabase.

---

## Step 8: Verify Deployment

### Test the Main Site

```
https://giftonscreen.pages.dev
```

### Test Gift Rendering

Create a test gift and verify:
```
https://giftonscreen.pages.dev/public/preview.html
```

Then test the gift URL:
```
https://giftonscreen-worker.your-subdomain.workers.dev/g/GIFT-XXXXX
```

---

## Environment Variables Reference

### Frontend (Pages)

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anon/public key | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `GITHUB_TOKEN` | GitHub personal access token | Yes |
| `GITHUB_REPO` | Template repository (user/repo) | Yes |

### Worker (API)

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Yes |
| `GITHUB_TOKEN` | GitHub personal access token | Yes |
| `GITHUB_REPO` | Template repository (user/repo) | Yes |

---

## Project Structure

```
Giftonscreen7/
├── public/                  # Frontend assets (deployed to Pages)
│   ├── index.html          # Templates gallery
│   ├── create.html         # Gift creation form
│   ├── preview.html        # Gift preview
│   ├── admin.html          # Admin panel
│   ├── login.html          # Auth pages
│   └── js/                 # Client-side JavaScript
├── worker/                 # Cloudflare Worker
│   ├── index.js           # Worker entry point
│   ├── wrangler.toml      # Worker config
│   └── README.md          # Worker documentation
├── core/                   # Shared JavaScript modules
│   ├── api.js             # API functions
│   ├── auth.js            # Authentication
│   ├── supabase.js        # Supabase client
│   └── cloudinary.js      # Image upload
├── database/              # SQL schemas
├── templates/             # Gift templates
├── wrangler.toml          # Pages config
└── CLOUDFLARE_SETUP.md    # This file
```

---

## Troubleshooting

### Worker Not Found (404)

- Verify worker is deployed: `wrangler deploy`
- Check route configuration in Cloudflare Dashboard

### CORS Errors

- Add your domain to Supabase Auth URL Configuration
- Check that `SUPABASE_URL` is set correctly

### Gift Pages Not Rendering

- Verify `SUPABASE_SERVICE_KEY` is the service role key (not anon key)
- Check GitHub token has access to the template repository
- Verify `GITHUB_REPO` format is `username/repo-name`

### Images Not Uploading

- Verify Cloudinary credentials are set correctly
- Check that `CLOUDINARY_CLOUD_NAME` matches your Cloudinary account

---

## Useful Commands

```bash
# Deploy worker only
cd worker && wrangler deploy

# View worker logs
wrangler tail

# Deploy Pages only
npx wrangler pages deploy . --project-name=giftonscreen

# Check secrets
wrangler secret list

# Delete and recreate secret
wrangler secret delete SECRET_NAME
wrangler secret put SECRET_NAME
```

---

## Security Notes

1. **Never commit secrets** - Always use `wrangler secret put`
2. **Use service role key only in Worker** - Never expose it to frontend
3. **Set up RLS policies** in Supabase to protect user data
4. **Enable HTTPS** - Cloudflare provides this by default
5. **Review GitHub token permissions** - Use minimal required scopes

---

## Next Steps

1. ✅ Deploy Worker for secure gift rendering
2. ✅ Deploy Pages for frontend
3. ✅ Configure custom domain (optional)
4. ✅ Set up monitoring in Cloudflare Dashboard
5. ✅ Configure analytics
6. ✅ Test complete user flow

---

## Support

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Supabase Docs](https://supabase.com/docs)
