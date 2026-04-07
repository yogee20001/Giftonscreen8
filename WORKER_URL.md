# GiftOnScreen Worker URL

## Worker Endpoint

**URL:** `https://giftonscreen8-worker.giftonscreen.workers.dev`

## Purpose

This Cloudflare Worker handles all gift rendering at the `/g/:giftId` route. It:
- Fetches gift data from Supabase
- Retrieves templates from GitHub
- Injects data into templates
- Returns rendered HTML

## Usage

### Admin Panel
- View Gift button links to: `{WORKER_URL}/g/{giftId}`

### Preview Page  
- Gift link shown to user: `{WORKER_URL}/g/{giftId}`

### Direct Access
Users can access gifts directly at:
```
https://giftonscreen8-worker.giftonscreen.workers.dev/g/GIFT-XXXXXX
```

## Files Using This URL

1. `public/js/admin.js` - Admin panel "View" buttons
2. `public/js/preview.js` - Gift link display after creation

## Configuration

The Worker URL is defined as a constant in both files:
```javascript
const WORKER_URL = 'https://giftonscreen8-worker.giftonscreen.workers.dev';
```

## Notes

- Gift links will show "Gift is being prepared" page until activated
- Once activated, the full template experience loads
- Links are permanent and valid for 1 year from creation
