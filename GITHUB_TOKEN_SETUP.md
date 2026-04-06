# GitHub Token Setup Guide

The Cloudflare Worker needs a GitHub Personal Access Token to fetch gift templates from your repository.

## Why is this needed?

The Worker fetches template HTML files from the GitHub repository `yogee20001/Giftonscreen8` to render gifts securely without exposing template URLs.

## Step-by-Step Guide to Create GitHub Token

### 1. Go to GitHub Settings
- Visit: https://github.com/settings/tokens
- Or navigate: Profile (top right) → Settings → Developer settings → Personal access tokens → Tokens (classic)

### 2. Generate New Token
- Click "Generate new token (classic)"
- Enter password if prompted

### 3. Configure Token
- **Note**: `GiftOnScreen Worker Access`
- **Expiration**: Select duration (recommend 90 days or 1 year)
- **Scopes**: Check the following:
  - ☑️ `repo` - Full control of private repositories
    - This includes all sub-scopes:
      - repo:status
      - repo_deployment
      - public_repo
      - repo:invite
      - security_events

### 4. Generate Token
- Scroll down and click "Generate token"

### 5. Copy Token
- ⚠️ **IMPORTANT**: Copy the token immediately! You won't be able to see it again.
- The token will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 6. Set Token in Cloudflare

#### For Pages (giftonscreen8):
```bash
cd d:\GOS\Giftonscreen7
echo YOUR_GITHUB_TOKEN_HERE | wrangler secret put GITHUB_TOKEN
```

#### For Worker:
```bash
cd d:\GOS\Giftonscreen7\worker
echo YOUR_GITHUB_TOKEN_HERE | wrangler secret put GITHUB_TOKEN
```

### 7. Verify Token is Set
```bash
# For Pages
wrangler secret list

# For Worker
cd worker && wrangler secret list
```

## Security Best Practices

1. **Never commit the token** to your repository
2. **Use classic tokens** (Fine-grained tokens don't work well with raw file access)
3. **Set expiration** to rotate tokens regularly
4. **Scope minimum access**: Only `repo` scope is needed
5. **Revoke if compromised**: Go to GitHub tokens page and delete immediately

## Troubleshooting

### Token Not Working
- Ensure you're using the correct token format (ghp_...)
- Verify the token has `repo` scope
- Check that the repository name in wrangler.toml matches exactly

### 404 Errors
- Verify the repository exists and is accessible
- Ensure the GitHub token has access to the repository
- Check that template files exist in the repository

### Rate Limiting
- GitHub API has rate limits (5000 requests/hour for authenticated users)
- If you hit limits, consider caching strategies in the Worker

## Alternative: Using GitHub App (Advanced)

For production applications with high traffic, consider using a GitHub App instead of a Personal Access Token for better rate limits and security.

## Need Help?

- GitHub Docs: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
- Cloudflare Workers: https://developers.cloudflare.com/workers/
