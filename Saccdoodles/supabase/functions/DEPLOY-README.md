# Deploying the Bunny Upload Edge Function

This Edge Function securely handles file uploads to Bunny CDN without exposing your API key.

## Prerequisites

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

## Deployment Steps

### Step 1: Link your project

Open a terminal in the `Saccdoodles` folder and run:

```bash
supabase link --project-ref kmqlmjkixqpgrbqvpqgp
```

### Step 2: Add your Bunny API key as a secret

```bash
supabase secrets set BUNNY_API_KEY=your-bunny-api-key-here
supabase secrets set BUNNY_STORAGE_HOST=https://la.storage.bunnycdn.com
supabase secrets set BUNNY_STORAGE_ZONE=saccdoodles
supabase secrets set BUNNY_CDN_URL=https://saccdoodles.b-cdn.net
```

**Get your Bunny API key from:** Bunny Dashboard → Storage → saccdoodles → FTP & API Access → Password

### Step 3: Deploy the function

```bash
supabase functions deploy bunny-upload --no-verify-jwt
```

Note: `--no-verify-jwt` allows the function to be called from your static site.

## Verify Deployment

After deployment, the function will be available at:
```
https://kmqlmjkixqpgrbqvpqgp.supabase.co/functions/v1/bunny-upload
```

You can test it by uploading a photo in the admin panel.

## Troubleshooting

If uploads fail, check the Edge Function logs:
```bash
supabase functions logs bunny-upload
```

## Security Notes

- The Bunny API key is stored securely in Supabase secrets
- It is NEVER sent to the browser
- The Edge Function acts as a secure proxy for uploads
