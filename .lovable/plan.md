
Goal: fix the persistent “Failed to fetch” when customizing diet/workout.

What I found
- The frontend request is being sent correctly from both `src/pages/Diet.tsx` and `src/pages/Workout.tsx`.
- `generate-plan` is live and returns 200 when called directly, so the backend itself is reachable.
- `modify-plan` is not live in the current backend: direct backend call returns `404 Requested function was not found`, and there are no logs for that function.
- The live `generate-plan` response still shows the old CORS header set, which means the deployed backend is out of sync with the current repo code.
- So this is primarily a backend deployment/sync issue, not a prompt or JSON parsing issue.

Implementation plan
1. Re-sync the backend functions
- Deploy `modify-plan` so it actually exists in the live backend.
- Re-deploy `generate-plan` too, because the live version is clearly stale.
- Confirm both functions respond directly after deployment.

2. Harden frontend function calls
- Replace raw `fetch(${VITE_SUPABASE_URL}/functions/v1/...)` in:
  - `src/pages/Onboarding.tsx`
  - `src/pages/Diet.tsx`
  - `src/pages/Workout.tsx`
- Use the project’s backend client invoke method instead of manual URL fetches.
- Centralize error handling so 404 / network / backend errors show a clearer toast than generic “Failed to fetch”.

3. Keep current function logic, but verify deployment-safe config
- Keep the existing CORS headers in both function files.
- Keep `verify_jwt = false` as currently configured unless auth is intentionally added later.
- Confirm the function names in code, config, and deployed backend all match exactly.

4. Validate end-to-end
- Test onboarding plan generation again.
- Test diet customization with a simple request like “I can’t eat banana”.
- Test workout customization with a simple request like “Add more core exercises”.
- Confirm browser no longer reports network-level fetch failure.

Files involved
- `src/pages/Onboarding.tsx`
- `src/pages/Diet.tsx`
- `src/pages/Workout.tsx`
- `supabase/functions/generate-plan/index.ts`
- `supabase/functions/modify-plan/index.ts`
- `supabase/config.toml`

Technical details
- Current evidence:
  - Network log shows browser POST to `.../functions/v1/modify-plan` ending in `Failed to fetch`.
  - Direct backend test shows `modify-plan` returns 404 “Requested function was not found”.
  - Direct backend test shows `generate-plan` returns 200, but with old headers, proving stale deployment.
- That combination strongly indicates:
  - `modify-plan` is missing from the live backend
  - `generate-plan` is deployed, but not the latest version
- The extra React warning around `Badge` refs is unrelated to this fetch failure. It can be cleaned up separately, but it is not the cause of the customization bug.

Expected outcome
- Customization works for both diet and workout.
- Onboarding generation and customization use one consistent backend-calling pattern.
- Errors become actionable instead of showing the vague browser-level fetch failure.
