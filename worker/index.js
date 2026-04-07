// Cloudflare Worker - Secure Gift Rendering
// Handles /g/:giftId routes

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const pathname = url.pathname;

        // Only handle /g/ routes
        if (!pathname.startsWith('/g/')) {
            return new Response('Not Found', { status: 404 });
        }

        // Extract gift ID
        const giftId = pathname.split('/g/')[1];

        if (!giftId || !giftId.startsWith('GIFT-')) {
            return renderError('Invalid gift ID', 400);
        }

        try {
            // Fetch gift from Supabase
            const gift = await fetchGift(giftId, env);

            if (!gift) {
                return renderError('Gift not found', 404);
            }

            // Check if expired
            if (isExpired(gift.expires_at)) {
                return renderExpired();
            }

            // Handle inactive state
            if (gift.status !== 'active') {
                return renderInactive();
            }

            // Fetch template from GitHub
            const templateHtml = await fetchTemplate(gift.template_id, env);

            if (!templateHtml) {
                return renderError('Template not found', 500);
            }

            // Inject data and return
            const html = injectData(templateHtml, gift.data, gift);
            return new Response(html, {
                headers: {
                    'Content-Type': 'text/html',
                    'Cache-Control': 'no-store'
                }
            });

        } catch (error) {
            console.error('Worker error:', error);
            return renderError('Something went wrong', 500);
        }
    }
};

/**
 * Fetch gift from Supabase REST API
 */
async function fetchGift(giftId, env) {
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = env;

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/gifts?id=eq.${giftId}`,
        {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Supabase error: ${response.status}`);
    }

    const data = await response.json();
    return data && data.length > 0 ? data[0] : null;
}

/**
 * Check if gift is expired
 */
function isExpired(expiresAt) {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
}

/**
 * Fetch template from private GitHub repo
 */
async function fetchTemplate(templateId, env) {
    const { GITHUB_TOKEN, GITHUB_REPO } = env;

    // First, get template info from Supabase
    const templateInfo = await fetchTemplateInfo(templateId, env);

    if (!templateInfo || !templateInfo.github_path) {
        return null;
    }

    // Construct GitHub raw URL
    const githubPath = templateInfo.github_path.replace(/\.js$/, '.html');
    const url = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${githubPath}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'User-Agent': 'GiftOnScreen-Worker'
        }
    });

    if (!response.ok) {
        console.error(`GitHub fetch failed: ${response.status}`);
        return null;
    }

    return await response.text();
}

/**
 * Fetch template metadata from Supabase
 */
async function fetchTemplateInfo(templateId, env) {
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = env;

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/templates?id=eq.${templateId}`,
        {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    );

    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    return data && data.length > 0 ? data[0] : null;
}

/**
 * Inject gift data into template
 * Replaces GIFT_DATA placeholder with actual data
 */
function injectData(templateHtml, giftData, gift) {
    const data = {
        ...giftData,
        giftId: gift.id,
        createdAt: gift.created_at,
        expiresAt: gift.expires_at
    };

    // Safely stringify data
    const jsonData = JSON.stringify(data)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026');

    // Replace the GIFT_DATA declaration in the template
    // Matches: const GIFT_DATA = { ... };
    return templateHtml.replace(
        /const GIFT_DATA = \{[^}]+\};/,
        `const GIFT_DATA = ${jsonData};`
    );
}

/**
 * Render inactive gift page
 */
function renderInactive() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gift - Preparing</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #fff;
            text-align: center;
            padding: 20px;
        }
        h2 { font-size: 2rem; margin-bottom: 1rem; }
        p { font-size: 1.1rem; color: #9ca3af; max-width: 400px; }
        .icon { font-size: 64px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="icon">🎁</div>
    <h2>Gift is being prepared</h2>
    <p>After payment, your gift will be activated shortly. Please check back later!</p>
</body>
</html>`;

    return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
    });
}

/**
 * Render expired gift page
 */
function renderExpired() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gift - Expired</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #1f2937;
            color: #fff;
            text-align: center;
            padding: 20px;
        }
        h2 { font-size: 2rem; margin-bottom: 1rem; }
        p { font-size: 1.1rem; color: #9ca3af; max-width: 400px; }
        .icon { font-size: 64px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="icon">⏰</div>
    <h2>Gift has expired</h2>
    <p>This gift is no longer available. Gifts expire after 1 year from creation.</p>
</body>
</html>`;

    return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
    });
}

/**
 * Render error page
 */
function renderError(message, status) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #1f2937;
            color: #fff;
            text-align: center;
            padding: 20px;
        }
        h2 { font-size: 2rem; margin-bottom: 1rem; color: #ef4444; }
        p { font-size: 1.1rem; color: #9ca3af; }
        .icon { font-size: 64px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="icon">⚠️</div>
    <h2>Oops!</h2>
    <p>${message}</p>
</body>
</html>`;

    return new Response(html, {
        status,
        headers: { 'Content-Type': 'text/html' }
    });
}
