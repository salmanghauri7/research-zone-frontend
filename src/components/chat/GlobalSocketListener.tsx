import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Socket } from 'socket.io-client';
import { useNotification } from '@/contexts/NotificationContext';

interface MessageNotification {
    workspaceId: string;
    senderName: string;
    messagePreview?: string;
    workspaceName?: string;
}

interface GlobalSocketListenerProps {
    socket: Socket | null;
}

export default function GlobalSocketListener({ socket }: GlobalSocketListenerProps) {
    const pathname = usePathname();
    const { showInfo } = useNotification();

    // Stable callback using useCallback
    const handleNewMessage = useCallback((notification: MessageNotification) => {
        // Define what your active chat route looks like
        const activeChatRoute = `/workspace/${notification.workspaceId}/chat`;
        const currentPath = window.location.pathname; // Use window.location for most current path

        console.log('🔔 Message notification received:', {
            workspaceId: notification.workspaceId,
            sender: notification.senderName,
            currentPath,
            activeChatRoute,
            shouldShow: currentPath !== activeChatRoute
        });

        // Check if user is currently on the chat page for this workspace
        if (currentPath === activeChatRoute) {
            // User is ON the chat page.
            // Do nothing here. The chat component's local socket listener 
            // will handle displaying the message in real-time.
            console.log('📨 User is on chat page, skipping notification');
            return;
        }

        // User is online, but NOT on the chat page
        // Show a notification so they know a new message arrived
        const messageText = notification.messagePreview
            ? `${notification.senderName}: ${notification.messagePreview}`
            : `${notification.senderName} sent a message`;

        const workspaceText = notification.workspaceName
            ? ` in ${notification.workspaceName}`
            : '';

        console.log('✅ Showing notification for message from:', notification.senderName);
        showInfo(`New message${workspaceText} from ${notification.senderName}`);
    }, [showInfo]);

    useEffect(() => {
        if (!socket) {
            console.log('⚠️ GlobalSocketListener: No socket connection');
            return;
        }

        console.log('🔌 GlobalSocketListener: Setting up message-notified listener');
        socket.on('message-notified', handleNewMessage);

        return () => {
            console.log('🔌 GlobalSocketListener: Removing message-notified listener');
            socket.off('message-notified', handleNewMessage);
        };
    }, [socket, handleNewMessage]);

    return null;
}