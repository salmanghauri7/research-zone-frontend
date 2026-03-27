# Frontend Development Guide

## START HERE

Use this guide for local setup, common commands, debugging workflows, testing strategy, and deployment/build readiness.

IMPORTANT:

- Align Node/npm versions with project lockfile expectations.
- Keep environment variables explicit before running auth, socket, or OAuth flows.
- Run lint and smoke checks before opening PRs.

## 1. Prerequisites

| Tool        | Recommended Version          | Purpose                 |
| ----------- | ---------------------------- | ----------------------- |
| Node.js     | 20.x LTS or newer            | Runtime                 |
| npm         | 10.x+                        | Package management      |
| Next.js     | from lockfile                | Framework build/runtime |
| Backend API | local or shared dev instance | Data/API dependency     |

## 2. Environment Configuration

Create/update `.env` with required variables:

```env
NEXT_PUBLIC_BASE_URL_API_DEV=http://localhost:5000
NEXT_PUBLIC_BASE_URL_API_PROD=https://your-production-api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

Notes:

- `NEXT_PUBLIC_*` variables are exposed to client bundle.
- Keep non-public secrets out of frontend env files.

## 3. Install and Run

```bash
npm install
npm run dev
```

App default: `http://localhost:3000`

Build and start production mode locally:

```bash
npm run build
npm run start
```

Lint:

```bash
npm run lint
```

## 4. Local Development Workflow

### Daily Loop

1. Pull latest changes.
2. Install dependencies if lockfile changed.
3. Run backend and frontend.
4. Validate target feature path manually.
5. Run lint before commit.
6. Update docs if behavior changed.

### Feature Branch Checklist

- Define route scope and module docs impacted.
- Confirm API shape with backend docs/contract.
- Add/adjust UI states: idle, loading, success, error, empty.
- Verify desktop and mobile behavior.
- Test auth and permission edge paths.

## 5. Debugging Techniques

### 5.1 Network/API Debugging

- Inspect browser Network tab for status codes and payload shape.
- Check if `Authorization` header is present on protected calls.
- Confirm refresh flow triggers only once per failed request.
- Verify logout route clears cookies when session expires.

### 5.2 State Debugging

- Inspect Zustand state transitions with temporary logs.
- Validate `workspaceStore` updates on route change to `/workspace/[id]`.
- Ensure `userStore` persistence is not stale across auth transitions.

### 5.3 Socket Debugging

- Confirm socket initialization only when access token exists.
- Check join-room behavior after workspace layout mount.
- Verify duplicate listeners are cleaned up on unmount.
- Inspect reconnection behavior under network changes.

### 5.4 Route Protection Debugging

- Validate proxy matches include route under test.
- Confirm cookie presence (`authCookie`) when expecting protected access.
- Test both unauthenticated and authenticated route transitions.

## 6. Common Issues and Solutions

| Issue                                     | Likely Cause                              | Solution                                                              |
| ----------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------- |
| Redirect loop between login and dashboard | Proxy auth-cookie mismatch                | Verify backend sets `authCookie` and frontend logout clears correctly |
| 401 on all protected endpoints            | Missing/expired token                     | Check localStorage token, refresh endpoint, and backend cookie state  |
| Google login fails silently               | Missing client ID or OAuth config         | Validate `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and provider setup            |
| OTP verification always fails             | Expired signup token or backend mismatch  | Re-run signup flow and inspect OTP request payload                    |
| Chat messages duplicate                   | Listener re-registration                  | Confirm `socket.off` cleanup in hooks and stable dependency arrays    |
| Invitation accept fails after login       | Missing stored invitation token/workspace | Validate invitationStorage lifecycle and clear logic                  |
| Folders not updating after create/delete  | Cached state not invalidated              | Invalidate cache key before refetch/update local list                 |
| Theme flicker on load                     | Theme not mounted before render           | Use mounted guard in theme-dependent UI                               |

## 7. Testing Strategy

This codebase currently relies heavily on manual feature testing. Recommended strategy:

### 7.1 Unit Tests

Target:

- utility functions (`invitationStorage`, transformations, validators)
- isolated hooks (debounce, websocket payload helpers)
- store actions (set/clear transitions)

Recommended tools:

- Vitest or Jest
- React Testing Library for component logic

### 7.2 Integration Tests

Target:

- auth flows (signup/login/otp)
- workspace switching and invitation acceptance
- saved papers folder operations
- chat message send/edit/delete/search behavior

Recommended tools:

- Playwright or Cypress for browser-level integration tests

### 7.3 E2E Smoke Suite

Minimum scenarios:

1. User signup -> verify OTP -> login.
2. Create workspace -> invite user -> accept invitation.
3. Search paper -> save to folder -> view in saved papers.
4. Send chat message -> edit -> delete.
5. Open paper chat and receive assistant response.

## 8. Performance Profiling Checklist

- Check dynamic imports are used for heavy shell components.
- Ensure expensive computations are memoized where needed.
- Verify no repeated API fetches caused by unstable dependencies.
- Audit list rendering for key stability and unnecessary rerenders.
- Validate large payload rendering (chat history) for scroll performance.

## 9. Accessibility Checklist

Before merge, verify:

- Inputs have labels and visible focus states.
- Interactive controls are keyboard reachable.
- Error and success messages are perceivable.
- Color contrast remains acceptable in light and dark themes.
- Dialog overlays support predictable close patterns.

## 10. Security Checklist

- Do not store sensitive secrets in client source.
- Do not log access tokens in production.
- Ensure token refresh logic cannot infinite loop.
- Escape/sanitize rich content when adding markdown/html rendering.
- Validate file upload constraints before transport.

## 11. Build and Deployment Considerations

### Build Readiness

- `npm run lint` passes.
- `npm run build` succeeds locally.
- Environment variables set in deploy target.
- API URLs point to correct environment.

### Deployment Notes

- Frontend depends on backend CORS + cookie settings.
- OAuth redirect URIs must include deployed domain.
- Socket endpoint must be reachable from deployed frontend.

## 12. Pull Request Review Checklist

- Feature behavior tested across happy + error paths.
- No direct endpoint strings in feature components if module client exists.
- No duplicate state source for workspace/user identity.
- No listener leaks from sockets, timers, or global event handlers.
- Loading and empty states handled.
- Docs updated for changed workflows/contracts.

## 13. Practical Runbook

### Add New API Call

1. Add function in appropriate `src/api` module.
2. Type request/response as close to contract as possible.
3. Consume in feature component with loading/error handling.
4. Document endpoint in [API_REFERENCE.md](./API_REFERENCE.md).

### Add New Protected Route

1. Create route under `src/app/(protected)`.
2. Ensure layout supports desired shell behavior.
3. Add proxy matcher if path family is new.
4. Add sidebar/navigation entry if needed.
5. Document in [ARCHITECTURE.md](./ARCHITECTURE.md) and [INDEX.md](./INDEX.md).

### Extend Chat Event

1. Add event handler in websocket hook.
2. Ensure cleanup via `socket.off`.
3. Update consuming component state transitions.
4. Validate real-time event interactions in multi-tab or multi-user scenario.

## 14. Definition of Done (Frontend)

- Behavior implemented and manually validated.
- Errors and retries handled gracefully.
- Accessibility and keyboard flow checked.
- Lint and build pass.
- Relevant docs updated.
