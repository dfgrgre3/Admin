# AI Integration Audit

Date: 2026-07-02

## Current Coverage

- Admin AI hub exists at `/admin/ai`.
- Dashboard embeds `AiCommandCenter` for copilot prompts, content generation, and risk students.
- Shared frontend AI layer exists in `src/lib/ai`:
  - `ai-client.ts`
  - `ai-hooks.ts`
  - `types.ts`
  - `providers/openrouter.ts`
- Frontend API routes proxy these AI flows:
  - `/api/admin/ai`
  - `/api/ai/chat`
  - `/api/ai/exam`
  - `/api/ai/recommendations`
- Admin sidebar and command palette already expose the AI hub.
- Admin header now exposes a global AI shortcut, so AI is one click away from every admin page.

## Main Gaps

- AI is not embedded in every workflow yet. It is centralized in the hub and dashboard, but pages like users, courses, exams, reports, tickets, payments, books, marketing, and settings do not all have contextual AI actions.
- The admin copilot does not yet receive structured page context automatically. For example, on a user detail page it should know the user id, current tab, permissions, recent activity, billing state, and risk signals.
- Generated AI content still depends on backend behavior for persistence and review queue handling.
- Some route handlers log request and response payloads in development-style `console.log`; these should be reduced or sanitized before production AI usage.
- There is duplicated AI proxy style between `/api/admin/ai` and `/api/ai/*`; a single route helper would make timeouts, auth headers, and error handling more consistent.
- No automated test specifically verifies the AI hub contract, AI route payload shape, or permission checks for AI actions.
- Some Arabic strings render as mojibake in PowerShell output, indicating historical encoding issues in files or terminal display. Browser rendering should be verified directly.

## Recommended Full-Site AI Plan

1. Add a contextual AI drawer to the admin layout.
2. Build a `getAdminAiContext(pathname)` layer that returns safe, page-specific context.
3. Add workflow actions per module:
   - Users: summarize profile, detect risk, draft intervention, explain billing/security state.
   - Courses: generate outlines, lesson summaries, SEO drafts, curriculum gap analysis.
   - Exams: generate questions, grade essays, explain weak topics, create variants.
   - Reports/Analytics: summarize trends, find anomalies, suggest next actions.
   - Tickets/Forum: summarize threads, draft replies, classify sentiment and priority.
   - Marketing/Announcements: draft campaigns, A/B copy, audience segmentation suggestions.
   - Settings/Security: explain risky config, summarize audit logs, suggest hardening.
4. Keep human approval for destructive or external actions.
5. Add tests for AI proxy permissions, request validation, and UI disabled/error states.

## Verification Notes

- `npm test` did not execute tests successfully in this environment because Vitest workers timed out before running test files.
- `npm run build` reached Next.js build work but timed out with an EPIPE after the command limit.
- A later `npm run type-check` attempt failed because this PowerShell session could not locate `node.exe`, despite `npm` having run earlier.
