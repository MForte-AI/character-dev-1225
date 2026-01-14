# Admin Notes

## Verify deletion (server-only)

Endpoint: `POST /api/admin/verify-deletion`

Purpose: Check whether a collection or file (and its related rows) are fully removed from Supabase, plus optional storage existence check.

### Required env vars

- `ADMIN_VERIFY_TOKEN` (server-only secret used to authorize requests)
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Set `ADMIN_VERIFY_TOKEN` in Vercel Project Settings -> Environment Variables (Production + Preview). Do NOT expose it in client code.

### Example request

```bash
curl -X POST "https://<your-app>/api/admin/verify-deletion" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_VERIFY_TOKEN" \
  -d '{"collectionId":"...","fileId":"...","filePath":"..."}'
```

Payload fields are optional, but at least one is required:
- `collectionId`
- `fileId`
- `filePath` (Supabase Storage path)

### Response

The response is JSON with row counts for the requested IDs. Any non-zero counts indicate remaining data.

### Vercel cron note

This endpoint is POST-only and expects an auth token. If you want a scheduled check via Vercel Cron, add a dedicated cron route (GET) that calls this endpoint internally or add a GET handler with equivalent auth.

## Standard prompts (visible to all users)

Prompts with `sharing = 'public'` appear for every user in the Prompts list.
Only admins (`profiles.user_role = 'admin'`) see the Standard toggle in the UI.

### Create a standard prompt (SQL)

```sql
insert into prompts (user_id, name, content, sharing)
values (
  'YOUR_USER_ID',
  'Prompt name',
  'Prompt content goes here...',
  'public'
);
```

Use your own `user_id` (from `profiles.user_id`) as the owner. Standard prompts are read-only for other users.
