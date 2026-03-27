# Frontend API Reference

## START HERE

This file documents API usage as implemented in the frontend client. It is intentionally consumer-focused: endpoint usage, request shapes, response assumptions, and error handling behavior.

IMPORTANT:

- Backend remains the source of truth for domain contracts.
- Frontend docs capture current integration expectations and transformations.
- Keep this file synchronized whenever API module files under `src/api` change.

## 1. API Client Foundation

### Axios Instance

Path: `src/utils/axios.ts`

Configuration highlights:

- `baseURL`: currently local backend URL fallback.
- `withCredentials: true` for cookie-based refresh/session flows.
- Default `Content-Type: application/json`.

### Request Interceptor

Behavior:

1. Read `accessToken` from localStorage.
2. Add `Authorization` bearer header when present.

### Response Interceptor

Behavior:

1. For 401 on non-auth and non-refresh endpoint, call `GET /users/refresh` once.
2. Store new access token and replay original request.
3. If refresh fails, clear token, call `/api/logout`, redirect login.
4. Normalize backend message into `error.customMessage` when available.

## 2. Global Response Expectations

### Success Pattern (Expected)

```json
{
  "success": true,
  "message": "Operation successful",
  "statusCode": 200,
  "data": {}
}
```

### Error Pattern (Expected)

```json
{
  "success": false,
  "message": "Descriptive error",
  "statusCode": 400
}
```

### Frontend Error Interpretation

| Source                               | Behavior                             |
| ------------------------------------ | ------------------------------------ |
| `error.response.data.message` string | Show directly when safe              |
| message array (validation)           | Use first message entry when present |
| missing/unknown                      | fallback to generic message          |

## 3. Endpoint Usage Matrix

### 3.1 User API (`src/api/userApi.ts`)

| Method | Endpoint                           | Used For                    | Auth                      |
| ------ | ---------------------------------- | --------------------------- | ------------------------- |
| POST   | `/users/signup`                    | Register account            | Public                    |
| POST   | `/users/verifyOtp`                 | Verify signup OTP           | Signup flow token context |
| POST   | `/users/login`                     | Login with email/username   | Public                    |
| POST   | `/users/google-login`              | OAuth login using auth code | Public                    |
| GET    | `/users/resendOtp/:token`          | Resend OTP                  | Public with signup token  |
| GET    | `/users/refresh`                   | Refresh access token        | Cookie-based              |
| POST   | `/users/checkUsernameAvailability` | Onboarding username check   | Authenticated/new user    |
| POST   | `/users/addUsername`               | Save onboarding username    | Authenticated/new user    |

#### Request Examples

```ts
userApi.signup({
  firstName: "Ada",
  lastName: "Lovelace",
  username: "ada_l",
  email: "ada@example.com",
  password: "strong-password",
});

userApi.login({ email: "ada@example.com", password: "secret" });
userApi.login({ username: "ada_l", password: "secret" });
```

#### Response Data (Common Assumptions)

```ts
{
  data: {
    accessToken: string,
    user: {
      id: string,
      firstName: string,
      username: string,
      email: string
    },
    newUser?: boolean,
    token?: string
  }
}
```

### 3.2 Workspace API (`src/api/workspaceApi.ts`)

| Method | Endpoint                              | Used For                                 | Auth     |
| ------ | ------------------------------------- | ---------------------------------------- | -------- |
| POST   | `/workspaces/create`                  | Create workspace                         | Required |
| GET    | `/workspaces/owner`                   | Owner workspace list                     | Required |
| GET    | `/workspaces/all`                     | Owner + member workspaces                | Required |
| POST   | `/workspaces/:workspaceId/invite`     | Invite member by email                   | Required |
| POST   | `/workspaces/verify-invitation`       | Validate invitation token                | Public   |
| POST   | `/workspaces/accept-invitation`       | Accept workspace invitation              | Required |
| DELETE | `/workspaces/leave/:workspaceId`      | Leave/delete workspace based on role     | Required |
| GET    | `/workspaces/check-role/:workspaceId` | Resolve role/title for workspace context | Required |

#### Request Examples

```ts
workspaceApi.createWorkspace({ title: "ML Lab" });
workspaceApi.sendInvite("member@example.com", "Welcome!", workspaceId);
workspaceApi.verifyInvite(token);
workspaceApi.acceptInvite(token);
```

### 3.3 Papers API (`src/api/papersApi.ts`)

| Method | Endpoint                               | Used For                                | Auth     |
| ------ | -------------------------------------- | --------------------------------------- | -------- |
| GET    | `/papers/search?q=&page=`              | Search papers                           | Required |
| GET    | `/folders/workspace/:workspaceId/tree` | Folder tree for save modal/organization | Required |
| POST   | `/saved-papers`                        | Save paper into workspace/folder        | Required |
| DELETE | `/saved-papers/:paperId`               | Remove saved paper                      | Required |

#### Save Paper Request

```json
{
  "workspaceId": "ws_123",
  "folderId": "folder_abc",
  "title": "Attention Is All You Need",
  "link": "https://arxiv.org/abs/1706.03762",
  "authors": "Vaswani et al.",
  "published": "2017-06-12"
}
```

### 3.4 Folders API (`src/api/foldersApi.ts`)

| Method | Endpoint                                    | Used For                | Auth     |
| ------ | ------------------------------------------- | ----------------------- | -------- |
| GET    | `/folders/workspace/:workspaceId?folderId=` | Folder content listing  | Required |
| POST   | `/folders`                                  | Create folder           | Required |
| PATCH  | `/folders/:folderId`                        | Rename folder           | Required |
| DELETE | `/folders/:folderId/recursive`              | Recursive folder delete | Required |
| GET    | `/folders/:folderId/path`                   | Breadcrumb path         | Required |

#### Folder Create Request

```json
{
  "name": "Weekly Reading",
  "workspaceId": "ws_123",
  "parentFolderId": "root_or_nested"
}
```

### 3.5 Chat API (`src/api/chatApi.ts`)

| Method | Endpoint                                               | Used For                    | Auth     |
| ------ | ------------------------------------------------------ | --------------------------- | -------- |
| GET    | `/chat/workspace/:workspaceId/messages?limit=&cursor=` | Paginated message retrieval | Required |
| POST   | `/chat/workspace/:workspaceId/upload`                  | Attachment upload           | Required |
| POST   | `/chat/workspace/:workspaceId/search`                  | Search message history      | Required |

#### Fetch Messages Response (Normalized)

```ts
{
  messages: BackendMessage[],
  cursor: string | null,
  hasMore: boolean
}
```

#### Upload Attachments Request

- Multipart form payload, key `files` repeated per file.

#### Upload Attachments Response Data

```ts
{
  attachments: [{
    url: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
    fileKey: string
  }],
  totalFiles: number
}
```

### 3.6 Paper Chat API (`src/api/paperChatApi.ts`)

| Method | Endpoint                                    | Used For                            | Auth     |
| ------ | ------------------------------------------- | ----------------------------------- | -------- |
| POST   | `/paper-chat/embeddings`                    | Prepare/select paper context        | Required |
| GET    | `/paper-chat/session/:workspaceId/:paperId` | Get/create paper chat session       | Required |
| POST   | `/paper-chat/message`                       | Session message send/response       | Required |
| POST   | `/paper-chat/question`                      | Simple ask-question flow used by UI | Required |
| GET    | `/paper-chat/history/:sessionId`            | Session history retrieval           | Required |
| DELETE | `/paper-chat/session/:sessionId`            | Session deletion                    | Required |
| GET    | `/paper-chat/sessions/:workspaceId`         | List workspace sessions             | Required |

## 4. Frontend DTOs and Transform Rules

### Chat Message Transformation

Backend message shape is transformed into frontend `Message`:

| Backend Field                 | Frontend Field  | Notes                        |
| ----------------------------- | --------------- | ---------------------------- |
| `_id`                         | `id`            | Primary identity             |
| `sender.firstName + lastName` | `sender.name`   | Display string               |
| `createdAt`                   | `timestamp`     | Converted to Date            |
| `replyCount`                  | `threadCount`   | Thread badge                 |
| `quotedMessageId`             | `replyTo`       | Resolved by in-memory lookup |
| `attachments[]`               | `attachments[]` | Type inferred from MIME      |

## 5. Error Handling Matrix

| Context                 | Typical Status | Frontend Behavior                         |
| ----------------------- | -------------- | ----------------------------------------- |
| Login failure           | 401/403        | Show inline auth error text               |
| Signup conflict         | 409            | Map to field-level form error             |
| OTP invalid             | 400            | Clear OTP and show retry message          |
| Refresh failure         | 401            | Clear token, logout route, redirect login |
| Workspace invite fail   | 4xx/5xx        | Toast/error state and keep modal open     |
| Chat search/upload fail | 4xx/5xx        | Notification + graceful fallback          |
| Folder CRUD fail        | 4xx/5xx        | Notification and preserve previous list   |

## 6. Loading-State Conventions

| Pattern                    | Location                                  | Purpose                          |
| -------------------------- | ----------------------------------------- | -------------------------------- |
| Button spinner text swap   | Auth forms, invite modal, settings action | Prevent duplicate submits        |
| Full-area skeleton/spinner | dynamic imports and chat loading          | Communicate blocked content      |
| Optimistic append          | Chat send flow                            | Reduce interaction latency       |
| Cached response replay     | paper search and folders                  | Avoid unnecessary loading states |

## 7. Security Considerations for API Calls

- Never expose long-lived secrets in client code.
- Keep refresh token in HTTP-only cookie.
- Always clear client token and stores when refresh fails.
- Sanitize server-driven message rendering where rich text might be added later.
- Validate uploaded file types and sizes before posting when extending chat uploads.

## 8. Integration Notes by Module

| Module         | API Clients                                   | Notes                                        |
| -------------- | --------------------------------------------- | -------------------------------------------- |
| Authentication | userApi, workspaceApi (invitation acceptance) | Conditional post-login invitation completion |
| Workspaces     | workspaceApi                                  | Central role/title sync with workspaceStore  |
| Papers         | papersApi + foldersApi                        | Save flow depends on workspace context       |
| Chat           | chatApi + websocket events                    | Blend REST history with socket updates       |
| Paper Chat     | paperChatApi                                  | Embedding prep before questions              |
| Folders        | foldersApi + papersApi delete                 | Shared with saved papers UX                  |
| Saved Papers   | foldersApi + papersApi delete                 | Folder-first rendering model                 |
| User Profile   | workspaceApi (leave/delete), logout route     | Role-sensitive destructive actions           |

## 9. API Change Checklist

When API behavior changes:

- Update `src/api` module signature.
- Update this file endpoint table and samples.
- Update affected module README workflow steps.
- Update error matrix for changed status semantics.
- Add migration note in [DEVELOPMENT.md](./DEVELOPMENT.md).
