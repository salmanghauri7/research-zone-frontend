import { Message } from "../types";
import { BackendMessage } from "../apis/chatApi";

const formatSenderName = (sender: {
  firstName?: string;
  name?: string;
}): string => {
  if (sender.name) {
    return sender.name;
  }

  return sender.firstName || "";
};

export const transformBackendMessage = (
  backendMsg: BackendMessage,
  quotedMessagesMap: Map<string, BackendMessage>,
): Message => {
  const messageId = backendMsg._id;
  const quotedMessageId = backendMsg.quotedMessageId;

  const message: Message = {
    id: messageId,
    clientId: (backendMsg as any).clientId || null,
    content: backendMsg.content,
    sender: {
      id: backendMsg.sender._id,
      name: backendMsg.sender.firstName,
      avatar: backendMsg.sender.avatar,
    },
    timestamp: new Date(backendMsg.createdAt),
    isEdited: backendMsg.isEdited,
    isDeleted: backendMsg.isDeleted || false,
    threadCount: backendMsg.replyCount || 0,
    parentMessageId: backendMsg.parentMessageId || null,
  };

  if (quotedMessageId && quotedMessagesMap.has(quotedMessageId)) {
    const quotedMsg = quotedMessagesMap.get(quotedMessageId)!;
    message.replyTo = {
      id: quotedMsg._id,
      content: quotedMsg.content,
      sender: {
        id: quotedMsg.sender._id,
        name: formatSenderName(quotedMsg.sender),
        avatar: quotedMsg.sender.avatar,
      },
      timestamp: new Date(quotedMsg.createdAt),
    };
  }

  if (backendMsg.attachments && backendMsg.attachments.length > 0) {
    message.attachments = backendMsg.attachments.map((att, index) => ({
      id: `${backendMsg._id}-att-${index}`,
      type: att.mimeType?.startsWith("image/") ? "image" : "file",
      url: att.url,
      name: att.fileName || att.url.split("/").pop() || "attachment",
    }));
  }

  return message;
};
