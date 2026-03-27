# Component Library

## START HERE

This catalog documents reusable UI and feature-level components in Research Zone Frontend.

IMPORTANT:

- Reuse existing components before creating new primitives.
- Preserve component contracts unless all consumers are updated.
- Add new reusable entries here when introducing shared components.

## 1. Component Categories

| Category             | Purpose                                      | Representative Paths                                                                |
| -------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------- |
| Shell Layout         | App framing/navigation                       | `components/layout/*`                                                               |
| Authentication       | Signup/login/OTP/onboarding UI               | `components/auth/*`, `components/onboarding/*`                                      |
| Workspace            | Workspace creation, switcher, invite flow UI | `components/CreateWorkspaceModal.tsx`, `components/dashboard/workspace/*`           |
| Papers               | Search and save workflows                    | `components/dashboard/papersLibrary.tsx`, `components/dashboard/SavePaperModal.tsx` |
| Saved Papers/Folders | Folder tree and management UI                | `components/saved-papers/*`                                                         |
| Chat                 | Team messaging and thread interfaces         | `components/chat/*`                                                                 |
| Paper Chat           | Paper-focused assistant interactions         | `components/paper-chat/*`                                                           |
| Feedback/Utility     | Toast, loading, progress indicators          | `components/Toast.tsx`, `components/loading.tsx`, `components/NextProgress.tsx`     |

## 2. Shell Layout Components

### Sidebar

Path: `src/components/layout/sidebar/Sidebar.tsx`

Responsibilities:

- Render workspace-linked navigation entries.
- Open workspace switcher modal.
- Trigger create-workspace modal.
- Handle logout action.

Props:

- Internal only in current implementation.

Usage:

```tsx
// Used inside protected layout via dynamic import
<Sidebar />
```

### WorkspaceSwitcher

Path: `src/components/layout/sidebar/WorkspaceSwitcher.tsx`

Props:

```ts
interface WorkspaceSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
}
```

Responsibilities:

- Fetch workspace list.
- Filter owner vs member tabs.
- Navigate to selected workspace.

### Topbar

Path: `src/components/layout/topbar/Topbar.tsx`

Responsibilities:

- Render branding, search input placeholder, notification icon.
- Control theme selection.
- Trigger logout.

## 3. Authentication Components

### LoginPage

Path: `src/components/auth/login.tsx`

Features:

- Identifier/password login (email or username).
- Google OAuth code flow.
- Invitation-aware post-auth redirect logic.
- Form validation via zod + react-hook-form.

### SignupPage

Path: `src/components/auth/signup.tsx`

Features:

- Full registration form + validation.
- Handles backend conflict errors at field level.
- Stores resend token for OTP flow.

### VerifyOTPPage

Path: `src/components/auth/verifyotp.tsx`

Features:

- 6-digit segmented input with focus management.
- Auto-submit when complete.
- Retry/resend timer integration.

### Username

Path: `src/components/onboarding/Username.tsx`

Features:

- Debounced username availability check.
- Inline status indicators.
- Final username submission and onboarding progression.

## 4. Workspace Components

### CreateWorkspaceModal

Path: `src/components/CreateWorkspaceModal.tsx`

Contract:

- Reads open/close state from ModalContext.
- Submits workspace title and redirects to new workspace route.

### InviteModal

Path: `src/components/dashboard/workspace/InviteModal.tsx`

Props:

```ts
interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}
```

Features:

- Invite by email + optional message.
- Toast feedback for success/failure.

### ActiveWorkspaces

Path: `src/components/dashboard/workspace/activeWorkspaces.tsx`

Features:

- Dashboard-level workspace cards and quick access patterns.

## 5. Papers Components

### PaperLibrary

Path: `src/components/dashboard/papersLibrary.tsx`

Features:

- Search papers by query and page.
- Caches results by query-page key.
- Save action opens SavePaperModal.

### SavePaperModal

Path: `src/components/dashboard/SavePaperModal.tsx`

Features:

- Folder selection and paper save action.
- Integrates with `savePaper` and folder tree API.

## 6. Saved Papers and Folders Components

### SavedPapersContent

Path: `src/components/saved-papers/SavedPapersContent.tsx`

Responsibilities:

- Fetch and render mixed folder/paper list.
- Manage sorting, view mode, breadcrumb navigation.
- Handle folder CRUD and paper deletion.

### Supporting Components

| Component                 | Purpose                             |
| ------------------------- | ----------------------------------- |
| `FolderBreadcrumb`        | Hierarchy navigation                |
| `FolderHeader`            | Context title and counts            |
| `FolderControls`          | Sort and view mode controls         |
| `FolderList`              | List/grid rendering                 |
| `FolderModal`             | Create/edit folder dialog           |
| `DeleteFolderModal`       | Folder/paper confirmation modal     |
| `FolderItem`, `PaperItem` | Item-level presentation and actions |

## 7. Chat Components

### ChatContainer

Path: `src/components/chat/ChatContainer.tsx`

Props:

```ts
interface ChatContainerProps {
  messages: Message[];
  currentUser: User;
  channelName?: string;
  onSendMessage: (
    content: string,
    attachments?: File[],
    replyTo?: Message,
  ) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onSendThreadReply: (
    parentId: string,
    content: string,
    attachments?: File[],
    replyTo?: Message,
  ) => void;
  threadReplies?: Record<string, Message[]>;
  workspaceId?: string;
  isUploadingAttachments?: boolean;
  highlightedMessageId?: string | null;
}
```

Features:

- Date-grouped message rendering.
- Reply/edit/thread interactions.
- Typing indicator integration.
- Thread panel side-view with responsive behavior.

### Related Chat Components

| Component            | Responsibility                           |
| -------------------- | ---------------------------------------- |
| `ChatMessage`        | Message rendering with actions           |
| `MessageInput`       | Send/edit UI, attachment selection       |
| `ThreadPanel`        | Parent thread and replies                |
| `SearchChat`         | Search trigger and query capture         |
| `SearchResultsPanel` | Search result list and jump interactions |
| `DeleteConfirmModal` | Confirm destructive message deletion     |

## 8. Paper Chat Components

### PaperChatContainer

Path: `src/components/paper-chat/PaperChatContainer.tsx`

Props:

```ts
interface PaperChatContainerProps {
  workspaceId: string;
}
```

Features:

- Paper selection and embedding prep.
- Message timeline for paper-specific assistant Q&A.
- Suggested prompts before first message.

### Related Components

| Component          | Responsibility                        |
| ------------------ | ------------------------------------- |
| `PaperPicker`      | Select paper within workspace context |
| `WelcomeView`      | Empty-state intro and CTA             |
| `PaperContextBar`  | Selected paper summary + actions      |
| `ChatMessages`     | Message stream rendering              |
| `ChatInput`        | Prompt submission input               |
| `SuggestedPrompts` | Starter question shortcuts            |

## 9. Shared Utility Components

### Toast

Path: `src/components/Toast.tsx`

Use:

- NotificationContext global toasts.
- Module-level status feedback when needed.

### NextProgress

Path: `src/components/NextProgress.tsx`

Use:

- Route transition progress feedback.

### Loading

Path: `src/components/loading.tsx`

Use:

- Generic loading placeholders.

## 10. Component Extension Guidelines

Before creating a new component:

1. Check this catalog for suitable existing candidate.
2. Check if variation can be prop-driven extension.
3. Keep reusable component API narrow and explicit.
4. Add usage examples in this file.

## 11. Example Composition Patterns

### Feature Container + Presentational Child

```tsx
function WorkspaceFeatureContainer() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await workspaceApi.getWorkspaces();
        setItems(res.data.data || []);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return <WorkspaceList items={items} isLoading={isLoading} />;
}
```

### Toast-Driven Error Handling

```tsx
function useFolderAction() {
  const { showSuccess, showError } = useNotification();

  const create = async (workspaceId: string, name: string) => {
    try {
      await folderApi.createFolder(workspaceId, name, null);
      showSuccess("Folder created");
    } catch {
      showError("Failed to create folder");
    }
  };

  return { create };
}
```

## 12. Library Maintenance Checklist

- Update this file whenever shared component contracts change.
- Keep props examples aligned with real types.
- Note deprecations and migration instructions if any component is replaced.
