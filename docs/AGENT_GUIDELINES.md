# Frontend Agent Guidelines

IMPORTANT: READ THIS BEFORE MODIFYING CODE.

This document defines mandatory coding standards for agents contributing to Research Zone Frontend.

## START HERE Reading Order

1. [INDEX.md](./INDEX.md)
2. [README.md](./README.md)
3. [ARCHITECTURE.md](./ARCHITECTURE.md)
4. Relevant module README under `docs/modules/*`
5. [API_REFERENCE.md](./API_REFERENCE.md)
6. [DEVELOPMENT.md](./DEVELOPMENT.md)

## 1. Component Patterns (Mandatory)

### 1.1 Use Functional Components

- Use function components only.
- Prefer typed props interfaces for all exported components.
- Keep route pages thin: orchestration only, not deep business logic.

### 1.2 Hooks Usage Rules

- Place hooks at top-level, never inside conditionals.
- Extract repeatable behavior into custom hooks.
- Stabilize callback props with `useCallback` when passed deeply.
- Use `useMemo` for expensive transforms and derived structures.
- Always clean up effects (listeners, timers, object URLs, sockets).

### 1.3 Component Responsibility Boundaries

| Component Type           | Allowed                                     | Disallowed                        |
| ------------------------ | ------------------------------------------- | --------------------------------- |
| Page                     | route params, feature composition           | deeply nested business logic      |
| Feature container        | orchestration, API calls, state transitions | cross-feature global side effects |
| Presentational component | render UI from props                        | direct API calls                  |
| Shared primitive         | reusable visual behavior                    | feature-specific data assumptions |

## 2. State Management Standards

### 2.1 Decision Rules

- Use local state for ephemeral component concerns.
- Use Zustand for cross-route persisted feature identity (`user`, `workspace`).
- Use Context for cross-cutting concerns (theme, notifications, socket, modal toggles).

### 2.2 Prohibited State Anti-Patterns

- Duplicate the same state in both Context and Zustand.
- Store derived data that can be computed cheaply.
- Use module-level mutable objects as hidden state stores.

## 3. File Organization Rules

- API calls live in `src/api`.
- Reusable hooks live in `src/hooks`.
- Shared contexts live in `src/contexts`.
- Route files stay under App Router segments in `src/app`.
- Feature components grouped by domain in `src/components/<feature>`.

Naming:

- Components: PascalCase.
- Hooks: camelCase with `use` prefix.
- Utilities: camelCase.
- Types/interfaces: PascalCase.

## 4. API Call Patterns

Mandatory:

1. Use module APIs (`src/api/*.ts`) for HTTP requests.
2. Type request/response payloads where practical.
3. Expose loading, success, and error state in UI.
4. Parse backend error message safely with fallback.
5. Avoid direct API URL literals in feature components.

Example pattern:

```ts
setIsLoading(true);
try {
  const data = await workspaceApi.getWorkspaces();
  setItems(data.data.data || []);
} catch (err) {
  showError("Unable to load workspaces");
} finally {
  setIsLoading(false);
}
```

## 5. Error Handling Standards

- Use NotificationContext for non-blocking errors.
- Use field-level errors for form validation failures.
- Never silently swallow network errors.
- Preserve previous stable UI state when request fails.

Preferred fallback hierarchy:

1. Specific backend message.
2. Contextual UI-specific message.
3. Generic fallback message.

## 6. CSS and Styling Standards

### 6.1 Styling Approach

- Use Tailwind utility classes for component-local styling.
- Use design tokens from CSS variables for color/semantic styling.
- Respect dark mode token mappings.

### 6.2 Reusable Patterns

- Keep utility class composition readable.
- Use variant-style booleans for conditional classes.
- Reuse existing animation utility classes in `globals.css`.

### 6.3 Avoid

- Hardcoded color values when token exists.
- Unbounded `z-index` inflation.
- Inline style objects for standard visual behavior.

## 7. Error Boundary and Resilience Guidance

Current code uses local error handling more than React error boundaries.

When adding critical new sections:

- Consider route-level boundary via App Router `error.tsx` pattern.
- Protect long lists and async-heavy sections with clear fallback states.

## 8. Testing Procedures

### Required for non-trivial changes

- Manual verification of happy path.
- Manual verification of failure path.
- Manual verification of loading state behavior.
- Validate route transition behavior.

### Recommended automation

- Unit tests for utils/hooks/store transitions.
- Integration tests for auth/workspace/chat flows.
- E2E smoke tests for major user journeys.

## 9. Code Review Checklist

Before finalizing changes, check:

- Component follows single responsibility.
- Hook dependencies are correct and stable.
- No event/timer/socket leak.
- UI handles loading + empty + error + success states.
- Accessibility basics covered (labels, focus, keyboard reachability).
- Security-sensitive data not logged or persisted unsafely.
- Documentation updated if behavior changed.

## 10. Performance Optimization Guidelines

- Dynamic import large shell components when route-level split is beneficial.
- Memoize expensive derived data and stable handlers.
- Avoid unnecessary full-list rerenders for small item updates.
- Use incremental fetch/cursor patterns for large collections.
- Revoke blob URLs and detach listeners on cleanup.

## 11. Accessibility Standards

Minimum standards:

- Inputs with labels.
- Buttons with meaningful text or accessible titles.
- Focus-visible states preserved.
- Keyboard interaction works for major controls.
- Announce async/error states where appropriate.

## 12. Security Standards

- Never embed secrets in client source.
- Use secure cookie/session flows for refresh behavior.
- Clear local tokens on auth failure and logout.
- Avoid rendering unsanitized HTML from external data.
- Validate file upload constraints on client before submit.

## 13. Anti-Patterns to Avoid

1. Calling `axios` directly from many components when API module exists.
2. Duplicating workspace role logic across unrelated components.
3. Mutating state directly instead of immutable update patterns.
4. Adding global providers for feature-local concerns.
5. Swallowing catch blocks without user feedback.
6. Changing route segment behavior without updating docs.
7. Introducing class components.
8. Mixing UI copy with hardcoded environment assumptions.

## 14. Agent Execution Protocol

For every change:

1. Read relevant module doc.
2. Identify existing pattern in neighboring code.
3. Implement with minimal surface area change.
4. Validate behavior and edge cases.
5. Update docs.
6. Report changed files and rationale.

## 15. Done Criteria for Agents

Work is complete when:

- Functional behavior is correct.
- State/data flow remains consistent with architecture.
- Error paths are handled.
- No obvious regressions in adjacent flow.
- Documentation reflects the implementation.
