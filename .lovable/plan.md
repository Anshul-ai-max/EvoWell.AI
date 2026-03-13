

# Fix: "Failed to Fetch" — Missing CORS Headers

## Root Cause
Both edge functions (`generate-plan` and `modify-plan`) have incomplete CORS headers. The Supabase JS client sends additional headers (`x-supabase-client-platform`, etc.) that aren't listed in `Access-Control-Allow-Headers`, causing the browser to block the preflight OPTIONS request entirely — resulting in "Failed to fetch".

## Fix

Update the `corsHeaders` in **both** files:

**File: `supabase/functions/generate-plan/index.ts`** (line 3-7)
**File: `supabase/functions/modify-plan/index.ts`** (line 3-7)

Replace:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
```

With:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
```

That's it — two lines changed in two files. No other changes needed.

