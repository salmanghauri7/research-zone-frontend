"use client";

import { useState, useCallback } from "react";
import { ChatContainer, Message, User } from "@/components/chat";

// Mock current user
const currentUser: User = {
  id: "user-1",
  name: "John Doe",
  avatar: undefined,
  isOnline: true,
};

// Mock messages for demonstration
const mockMessages: Message[] = [
  {
    id: "msg-1",
    content:
      "Hey team! I've been reviewing the latest research paper on quantum computing. Some fascinating insights on error correction.",
    sender: {
      id: "user-2",
      name: "Alice Johnson",
    },
    timestamp: new Date(Date.now() - 3600000 * 24),
    threadCount: 3,
  },
  {
    id: "msg-2",
    content: "That sounds interesting! Can you share the key findings?",
    sender: currentUser,
    timestamp: new Date(Date.now() - 3600000 * 23),
    replyTo: {
      id: "msg-1",
      content:
        "Hey team! I've been reviewing the latest research paper on quantum computing.",
      sender: { id: "user-2", name: "Alice Johnson" },
      timestamp: new Date(Date.now() - 3600000 * 24),
    },
  },
  {
    id: "msg-3",
    content:
      "Sure! The main takeaway is that they achieved a 99.5% fidelity rate using a novel surface code approach. I'll upload the PDF shortly.",
    sender: {
      id: "user-2",
      name: "Alice Johnson",
    },
    timestamp: new Date(Date.now() - 3600000 * 22),
  },
  {
    id: "msg-4",
    content:
      "I've also been looking into the implications for our current project. We might need to adjust our approach to the optimization algorithm.",
    sender: {
      id: "user-3",
      name: "Bob Smith",
    },
    timestamp: new Date(Date.now() - 3600000 * 2),
    threadCount: 1,
  },
  {
    id: "msg-5",
    content:
      "Great point, Bob! Let's schedule a meeting to discuss the potential changes. How does everyone's calendar look for tomorrow afternoon?",
    sender: {
      id: "user-2",
      name: "Alice Johnson",
    },
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: "msg-6",
    content: "Works for me! I'll send out a calendar invite.",
    sender: currentUser,
    timestamp: new Date(Date.now() - 1800000),
  },
];

// Mock thread replies
const mockThreadReplies: Record<string, Message[]> = {
  "msg-1": [
    {
      id: "reply-1",
      content: "I've read that paper too! The methodology is quite innovative.",
      sender: { id: "user-3", name: "Bob Smith" },
      timestamp: new Date(Date.now() - 3600000 * 20),
    },
    {
      id: "reply-2",
      content:
        "Should we consider implementing something similar in our project?",
      sender: currentUser,
      timestamp: new Date(Date.now() - 3600000 * 18),
    },
    {
      id: "reply-3",
      content:
        "Definitely worth exploring. I can prepare a feasibility analysis.",
      sender: { id: "user-2", name: "Alice Johnson" },
      timestamp: new Date(Date.now() - 3600000 * 16),
    },
  ],
  "msg-4": [
    {
      id: "reply-4",
      content: "What specific changes are you thinking about?",
      sender: { id: "user-2", name: "Alice Johnson" },
      timestamp: new Date(Date.now() - 3600000 * 1.5),
    },
  ],
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [threadReplies, setThreadReplies] =
    useState<Record<string, Message[]>>(mockThreadReplies);

  const handleSendMessage = useCallback(
    (content: string, attachments?: File[], replyTo?: Message) => {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        content,
        sender: currentUser,
        timestamp: new Date(),
        replyTo: replyTo,
        attachments: attachments?.map((file, index) => ({
          id: `att-${Date.now()}-${index}`,
          type: file.type.startsWith("image/") ? "image" : "file",
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        })),
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    [],
  );

  const handleEditMessage = useCallback(
    (messageId: string, newContent: string) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: newContent, isEdited: true }
            : msg,
        ),
      );
      // Also update thread replies if the message is in a thread
      setThreadReplies((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((threadId) => {
          updated[threadId] = updated[threadId].map((msg) =>
            msg.id === messageId
              ? { ...msg, content: newContent, isEdited: true }
              : msg,
          );
        });
        return updated;
      });
    },
    [],
  );

  const handleDeleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    // Also delete from thread replies
    setThreadReplies((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((threadId) => {
        updated[threadId] = updated[threadId].filter(
          (msg) => msg.id !== messageId,
        );
      });
      return updated;
    });
  }, []);

  const handleSendThreadReply = useCallback(
    (parentId: string, content: string, attachments?: File[]) => {
      const newReply: Message = {
        id: `reply-${Date.now()}`,
        content,
        sender: currentUser,
        timestamp: new Date(),
        attachments: attachments?.map((file, index) => ({
          id: `att-${Date.now()}-${index}`,
          type: file.type.startsWith("image/") ? "image" : "file",
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        })),
      };

      setThreadReplies((prev) => ({
        ...prev,
        [parentId]: [...(prev[parentId] || []), newReply],
      }));

      // Update thread count on parent message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === parentId
            ? { ...msg, threadCount: (msg.threadCount || 0) + 1 }
            : msg,
        ),
      );
    },
    [],
  );

  return (
    <div className="h-full flex flex-col">
      <ChatContainer
        messages={messages}
        currentUser={currentUser}
        channelName="Research Discussion"
        onSendMessage={handleSendMessage}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        onSendThreadReply={handleSendThreadReply}
        threadReplies={threadReplies}
      />
    </div>
  );
}
