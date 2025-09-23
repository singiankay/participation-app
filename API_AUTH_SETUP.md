# API Authentication Setup Guide

This guide explains how to set up and configure API key authentication for your participation app across all environments.

## Overview

Your API now requires authentication via API keys. The system is configured to:

- **Development**: Authentication is **disabled** (for easier testing)
- **Production**: Authentication is **required** (secure by default)

## Step 1: Generate API Keys

### Generate Keys Locally

```bash
# Generate 3 API keys (default)
npm run auth:generate-keys

# Generate 5 API keys
npm run auth:generate-keys 5
```

This will output something like:

```
Generated API Keys:
===================
1. a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
2. b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7
3. c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8

Environment Variable:
=======================
API_KEYS=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6,b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7,c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8
```

## Step 2: Local Development Setup

### 1. Add to `.env.local`

```bash
# Copy the API_KEYS value from the generation script
API_KEYS=your-generated-keys-here
```

### 2. Test Your API

```bash
# Test without API key (should work in development)
curl http://localhost:3000/api/participants

# Test with API key
curl -H "X-API-Key: your-api-key-here" http://localhost:3000/api/participants
```

## Step 3: GitHub Actions Setup

### 1. Go to GitHub Repository Settings

- Navigate to: **Settings** → **Secrets and variables** → **Actions**

### 2. Add New Repository Secret

- **Name**: `API_KEYS`
- **Value**: `your-generated-keys-here` (comma-separated)

### 3. Verify in `.github/workflows/ci-cd.yml`

The workflow already passes environment variables to Vercel:

```yaml
- name: Deploy to Vercel
  run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
  env:
    DATABASE_URL: ${{ steps.terraform.outputs.database_url }}
    DIRECT_URL: ${{ steps.terraform.outputs.direct_url }}
    API_KEYS: ${{ secrets.API_KEYS }} # ← This line should exist
```

## Step 4: Vercel Setup

### 1. Add Environment Variable in Vercel Dashboard

- Go to your Vercel project dashboard
- Navigate to: **Settings** → **Environment Variables**
- Add new variable:
  - **Name**: `API_KEYS`
  - **Value**: `your-generated-keys-here` (comma-separated)
  - **Environment**: Production

### 2. Alternative: Use Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Add environment variable
vercel env add API_KEYS
# Enter your API keys when prompted
```

## Step 5: Database Setup (No Changes Needed)

Your Neon database setup remains unchanged. The API keys are stored as environment variables, not in the database.

## Step 6: Testing Your Setup

### 1. Test Local Development

```bash
# Start your development server
npm run dev

# Test without API key (should work in development)
curl http://localhost:3000/api/participants

# Test with API key (should also work)
curl -H "X-API-Key: your-api-key" http://localhost:3000/api/participants
```

### 2. Test Production

```bash
# Test your production API
curl -H "X-API-Key: your-api-key" https://your-app.vercel.app/api/participants

# Test without API key (should fail with 401)
curl https://your-app.vercel.app/api/participants
```

## Security Best Practices

### 1. Key Management

- **Rotate keys regularly** (every 3-6 months)
- **Use different keys** for different environments
- **Never commit keys** to version control
- **Store keys securely** (GitHub Secrets, Vercel Environment Variables)

### 2. Key Distribution

- **Share keys securely** (use encrypted channels)
- **Track key usage** (monitor API logs)
- **Revoke compromised keys** immediately

### 3. Environment Separation

- **Development**: Use test keys
- **Staging**: Use staging keys
- **Production**: Use production keys

## Troubleshooting

### Common Issues

#### 1. "Authentication required" in Development

**Problem**: API returns 401 in development
**Solution**: Check your `.env.local` file has `API_KEYS` set

#### 2. "Invalid API key" in Production

**Problem**: API returns 401 with valid key
**Solution**:

- Verify `API_KEYS` is set in Vercel environment variables
- Check the key format (no spaces, correct comma separation)
- Ensure you're using the correct key for the environment

#### 3. CORS Issues with API Keys

**Problem**: Browser blocks requests with custom headers
**Solution**: The CORS middleware is already configured to handle `X-API-Key` header

### Debug Commands

```bash
# Check environment variables
echo $API_KEYS

# Test API key format
node -e "console.log(process.env.API_KEYS?.split(','))"

# Verify API endpoint
curl -v -H "X-API-Key: your-key" http://localhost:3000/api/participants
```

## API Usage Examples

### JavaScript/TypeScript

```javascript
const response = await fetch("/api/participants", {
  headers: {
    "X-API-Key": "your-api-key-here",
    "Content-Type": "application/json",
  },
});
```

### cURL

```bash
curl -H "X-API-Key: your-api-key-here" \
     -H "Content-Type: application/json" \
     https://your-app.vercel.app/api/participants
```

### Python

```python
import requests

headers = {
    'X-API-Key': 'your-api-key-here',
    'Content-Type': 'application/json'
}

response = requests.get('https://your-app.vercel.app/api/participants', headers=headers)
```

## Summary

Your API authentication is now set up with:

- ✅ **Simple API key authentication**
- ✅ **Environment-specific configuration**
- ✅ **Secure key generation**
- ✅ **GitHub Actions integration**
- ✅ **Vercel deployment support**
- ✅ **CORS and rate limiting compatibility**

The system is production-ready and follows security best practices!
