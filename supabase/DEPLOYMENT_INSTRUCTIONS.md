# Deploying Supabase Edge Function

Your OpenAI API key is now secure! Follow these steps to deploy the Edge Function.

## Prerequisites

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

## Step 1: Link Your Project

```bash
cd "c:\Users\teach\OneDrive\Desktop\Projects (VS Code)\Saccddoodles (Angela)\Saccdoodles"
supabase link --project-ref kmqlmjkixqpgrbqvpqgp
```

## Step 2: Set Your OpenAI Secret

Add your OpenAI API key as a secret (this keeps it hidden):

```bash
supabase secrets set OPENAI_API_KEY=your-openai-api-key-here
```

**Replace `your-openai-api-key-here` with your actual OpenAI API key from https://platform.openai.com/api-keys**

## Step 3: Deploy the Edge Function

```bash
supabase functions deploy generate-description
```

## Step 4: Test It

After deployment, test the function:

```bash
curl -L -X POST "https://kmqlmjkixqpgrbqvpqgp.supabase.co/functions/v1/generate-description" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a warm description for a friendly Goldendoodle", "dogData": {"name": "Bella", "breed": "Goldendoodle"}}'
```

## ✅ Done!

Your OpenAI key is now:
- ✅ Hidden on the server (not in client-side code)
- ✅ Secure in Supabase secrets
- ✅ Only accessible by your Edge Function

## Alternative: Deploy via Supabase Dashboard (No CLI)

If you don't want to use the CLI:

1. Go to https://app.supabase.com/project/kmqlmjkixqpgrbqvpqgp/functions
2. Click **Create a new function**
3. Name: `generate-description`
4. Copy the code from `supabase/functions/generate-description/index.ts`
5. Paste it into the editor
6. Click **Deploy function**
7. Go to **Settings** → **Secrets**
8. Add secret: `OPENAI_API_KEY` = `your-key-here`

---

## Troubleshooting

**Error: "OpenAI API key not configured"**
- Make sure you ran the `supabase secrets set` command
- Verify the secret is set in Supabase Dashboard → Settings → Secrets

**Error: "Function not found"**
- Make sure you deployed: `supabase functions deploy generate-description`
- Check that the function appears in Supabase Dashboard → Edge Functions

**CORS errors**
- The function already includes CORS headers, should work fine

---

## Security Benefits

**Before (Insecure):**
- ❌ OpenAI key exposed in `config.js`
- ❌ Anyone can view page source and steal it
- ❌ Could rack up charges on your account

**After (Secure):**
- ✅ OpenAI key stored in Supabase secrets
- ✅ Only accessible by server-side Edge Function
- ✅ No way for users to steal your key
- ✅ Full control over API usage
