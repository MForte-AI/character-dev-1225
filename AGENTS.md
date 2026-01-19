# Agent Instructions

These are repo-specific guidelines for Codex or other coding agents.

## Safety & Permissions
- Do not run production-impacting actions (deploys, migrations, data backfills) unless explicitly requested.
- Do not use service-role or admin tokens outside server-only code paths.
- Treat Supabase RLS as source of truth; avoid client-side bypasses.

## Admin-Only Features
- Any admin-only UI or endpoints must verify `profiles.user_role === 'admin'`.
- User-facing content must not expose admin/system prompts or internal instructions.

## Coding Conventions
- Prefer small, focused changes with minimal scope.
- Keep UI behavior consistent across admin and non-admin flows.
- Avoid introducing new dependencies unless required.

## Testing & Validation
- Run only targeted checks when asked (do not run full suites by default).
- If you cannot run tests, state what was not verified.

## Deliverables
- Summarize changes with file paths.
- Note any required environment variables or deployment steps.
