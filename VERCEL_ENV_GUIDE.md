# Environment Variables for Vercel Deployment

## Required Environment Variables

Copy these exact variable names and values to your Vercel project settings:

### Database (Supabase)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Maps (Mapbox)
```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here
```

### AI Chat (OpenRouter)
```
OPENAI_API_KEY=sk-or-v1-your_openrouter_key_here
```

### Site Configuration
```
NEXT_PUBLIC_SITE_URL=https://your-app-name.vercel.app
```

## How to Add in Vercel:

1. Go to https://vercel.com/dashboard
2. Select your `chamber-cons` project
3. Go to Settings → Environment Variables
4. Add each variable one by one:
   - Variable Name: (copy exactly from above)
   - Value: (your actual key/URL)
   - Environment: Production, Preview, Development (select all)

## Getting Your Values:

### Supabase:
- URL: In your Supabase dashboard → Settings → API
- Anon Key: In your Supabase dashboard → Settings → API

### Mapbox:
- Token: In your Mapbox dashboard → Access tokens

### OpenRouter:
- API Key: From your OpenRouter account dashboard

## After Adding Variables:
1. Click "Redeploy" in Vercel
2. Or push a new commit to trigger automatic deployment

## Troubleshooting:
- Make sure variable names match exactly (case-sensitive)
- Ensure all environments are selected for each variable
- Check that URLs don't have trailing slashes
- Verify API keys are active and have correct permissions