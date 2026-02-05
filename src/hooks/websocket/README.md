# WebSocket Event Handling

This directory contains modular websocket event handlers following Next.js best practices.

## Structure

```
hooks/websocket/
├── index.ts                    # Exports all hooks and types
├── types.ts                    # TypeScript interfaces for events
└── useWorkspaceEvents.ts       # Workspace-specific event handlers
```

## Usage

### Basic Example

```tsx
import { useWorkspaceEvents } from "@/hooks/websocket";
import { useSocket } from "@/contexts/SocketContext";

function WorkspacePage() {
  const { socket } = useSocket();
  const workspaceId = "workspace-id";

  const { joinWorkspace } = useWorkspaceEvents({
    socket,
    workspaceId,
  });

  useEffect(() => {
    joinWorkspace();
  }, [joinWorkspace]);
}
```

### With Custom Handlers

```tsx
const { joinWorkspace } = useWorkspaceEvents({
  socket,
  workspaceId,
  onWorkspaceJoined: (data) => {
    // Update workspace state
    console.log("Joined:", data.title);
  },
  onUserJoined: (data) => {
    // Refresh member list
    console.log("New member:", data.email);
  },
  onError: (error) => {
    // Handle error
    console.error(error.message);
  },
});
```

## Events

### Emitted Events

- `join-workspace`: Join a workspace room
  ```ts
  socket.emit("join-workspace", { workspaceId: string });
  ```

### Listened Events

- `joined-workspace`: Successfully joined workspace
  ```ts
  {
    _id: string;
    title: string;
    color: string;
    memberCount: number;
  }
  ```

- `user-joined-workspace`: Another user joined the workspace
  ```ts
  {
    userId: string;
    email: string;
    workspaceId: string;
  }
  ```

- `join-workspace-error`: Error joining workspace
  ```ts
  {
    message: string;
    error?: string;
  }
  ```

## Notifications

All events automatically show notifications via the `NotificationContext`:
- ✅ Success: When you join a workspace
- ℹ️ Info: When another user joins
- ❌ Error: When there's an error

## Adding New Event Handlers

1. Add types to `types.ts`
2. Create a new hook file (e.g., `useChatEvents.ts`)
3. Export from `index.ts`
4. Use in components

Example:

```ts
// hooks/websocket/useChatEvents.ts
export const useChatEvents = ({ socket, chatId }) => {
  const { showSuccess } = useNotification();

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      showSuccess("New message received");
    };

    socket.on("new-message", handleNewMessage);
    return () => socket.off("new-message", handleNewMessage);
  }, [socket, showSuccess]);

  return { sendMessage: (msg) => socket.emit("send-message", msg) };
};
```
