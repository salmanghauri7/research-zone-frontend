import { Message } from "../types";
import { Socket } from "socket.io-client";
import type { Dispatch, SetStateAction } from "react";

export type ChatSocketAttachment = {
  mimeType?: string;
  url: string;
  fileName?: string;
};

export type ChatSocketMessageData = {
  _id?: string;
  id?: string;
  clientId?: string;
  content: string;
  sender: {
    _id?: string;
    id?: string;
    firstName: string;
    username?: string;
    avatar?: string;
  };
  createdAt: string;
  isEdited?: boolean;
  replyCount?: number;
  attachments?: ChatSocketAttachment[];
  quotedMessageId?: string;
  parentMessageId?: string;
};

export interface UseChatSocketHandlersProps {
  socket: Socket | null;
  currentWorkspaceId: string | null;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  setThreadReplies: Dispatch<SetStateAction<Record<string, Message[]>>>;
}
