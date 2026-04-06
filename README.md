# 🎁 GiftOnScreen

Create beautiful digital gifts for your loved ones. A secure, serverless gift rendering platform built with Cloudflare, Supabase, and modern web technologies.

## ✨ Features

- 🎨 **Beautiful Templates** - Choose from stunning gift templates
- 📸 **Photo Uploads** - Add personal photos to your gifts
- 🔐 **Secure Rendering** - Gifts rendered securely via Cloudflare Workers
- 💳 **WhatsApp Activation** - Easy payment and activation via WhatsApp
- 👨‍💼 **Admin Dashboard** - Manage gift activations and monitor requests
- ⚡ **Serverless Architecture** - Scalable, fast, and cost-effective

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Cloudflare                           │
│  ┌─────────────────┐          ┌─────────────────────────┐  │
│  │  Cloudflare     │          │   Cloudflare Worker     │  │
│  │  Pages          │          │   (Secure Rendering)    │  │
│  │                 │◄────────►│                         │  │
│  │  Frontend App   │          │   /g/:giftId Endpoint   │  │
│  └─────────────────┘          └─────────────────────────┘  │
│           │                            │                    │
│           ▼                            ▼                    │
│    Static Assets                 Fetches from              │
│                                  Supabase + GitHub         │
└─────────────────────────────────────────────────────────────┘
                   │                            │
                   ▼                            ▼
          ┌─────────────┐              ┌─────────────┐
          │  Supabase   │              │   GitHub    │
          │  (DB/Auth)  │              │ (Templates) │
          └─────────────┘              └─────────────┘
```

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Supabase project](https://supabase.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/yogee20001/Giftonscreen8.git
cd Giftonscreen8

# Install dependencies
npm install

# Install Wrangler globally (if not already installed)
npm install -g wrangler
```

### Configuration

1. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

2. **Set up secrets:**
   ```bash
   # Supabase
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_ANON_KEY

   # Cloudinary (for image uploads)
   wrangler secret put CLOUDINARY_CLOUD_NAME
   wrangler secret put CLOUDINARY_API_KEY
   wrangler secret put CLOUDINARY_API_SECRET
   ```

3. **Configure Worker secrets:**
   ```bash
   cd worker
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_SERVICE_KEY
   wrangler secret put GITHUB_TOKEN
   wrangler secret put GITHUB_REPO
   cd ..
   ```

### Deployment

#### Option 1: Using npm scripts
```bash
npm run deploy
```

#### Option 2: Using deployment scripts
```bash
# Windows
.\deploy.bat

# macOS/Linux
./deploy.sh
```

#### Option 3: Manual deployment
```bash
# Deploy Worker
cd worker && wrangler deploy

# Deploy Pages
wrangler pages deploy . --project-name=giftonscreen8
```

## 📁 Project Structure

```
Giftonscreen7/
├── public/                 # Frontend application
│   ├── index.html         # Templates gallery
│   ├── create.html        # Gift creation form
│   ├── preview.html       # Gift preview page
│   ├── admin.html         # Admin dashboard
│   ├── login.html         # Authentication
│   └── js/                # Client-side JavaScript
│       ├── create.js
│       ├── preview.js
│       └── admin.js
├── worker/                # Cloudflare Worker
│   ├── index.js          # Worker entry point
│   ├── wrangler.toml     # Worker configuration
│   └── README.md         # Worker documentation
├── core/                  # Shared JavaScript modules
│   ├── api.js            # API functions
│   ├── auth.js           # Authentication
│   ├── supabase.js       # Supabase client
│   ├── cloudinary.js     # Image upload
│   └── utils.js          # Utilities
├── database/             # Database schemas
│   ├── schema.sql        # Main database schema
│   └── admin-schema.sql  # Admin tables
├── templates/            # Gift templates
│   └── candle-basic/     # Sample template
├── styles/               # Global styles
│   └── global.css
├── wrangler.toml         # Pages configuration
├── CLOUDFLARE_SETUP.md   # Detailed deployment guide
├── deploy.sh             # Unix deployment script
├── deploy.bat            # Windows deployment script
└── package.json          # Project configuration
```

## 🔄 User Flow

1. **Browse Templates** → User visits homepage and selects a template
2. **Create Gift** → Fills in receiver name, sender name, and message
3. **Preview** → Reviews the gift before creating
4. **Create Gift** → Gift is created with "inactive" status
5. **Activation Request** → Sent to admin dashboard automatically
6. **WhatsApp Payment** → User pays ₹59 via WhatsApp
7. **Admin Approval** → Admin activates the gift
8. **Share** → User shares the gift link with their loved one

## 🔐 Security Features

- **Secure Gift Rendering** - Gifts rendered server-side via Cloudflare Workers
- **Row Level Security** - Supabase RLS policies protect user data
- **No Template Exposure** - Template URLs never exposed to client
- **XSS Prevention** - Data injection uses safe JSON serialization
- **Environment Secrets** - All sensitive data stored as Cloudflare secrets

## 📚 Documentation

- **[CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md)** - Complete Cloudflare deployment guide
- **[worker/README.md](worker/README.md)** - Worker-specific documentation
- **[STRICT_BASE_ARCHITECTURE.md](STRICT_BASE_ARCHITECTURE.md)** - Architecture documentation

## 🛠️ Development

### Local Development

Since this is a static site with Cloudflare Workers, local development is straightforward:

```bash
# Serve static files locally
npx serve .

# Or use Python
python -m http.server 8080
```

For Worker development:
```bash
cd worker
wrangler dev
```

### Database Setup

Run the SQL files in Supabase SQL Editor:

1. `database/schema.sql` - Main database schema
2. `database/admin-schema.sql` - Admin tables and functions

## 🌐 Environment Variables

### Frontend (Pages)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase public API key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `GITHUB_TOKEN` | GitHub personal access token |
| `GITHUB_REPO` | Template repository path |

### Worker

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `GITHUB_TOKEN` | GitHub personal access token |
| `GITHUB_REPO` | Template repository path |

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For questions or support, please open an issue on GitHub.

---

Made with ❤️ using Cloudflare, Supabase, and modern web technologies.
