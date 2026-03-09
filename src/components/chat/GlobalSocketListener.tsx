import { useEffect, useCallback, useRef } from 'react';
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

    // Use ref for showInfo to avoid recreating callback
    const showInfoRef = useRef(showInfo);

    useEffect(() => {
        showInfoRef.current = showInfo;
    }, [showInfo]);

    // Stable callback using useCallback with no dependencies except ref
    const handleNewMessage = useCallback((notification: MessageNotification) => {
        // Define what your active chat route looks like
        const activeChatRoute = `/workspace/${notification.workspaceId}/chat`;
        const currentPath = window.location.pathname; // Use window.location for most current path

        console.log('\n🔔 ========================================');
        console.log('🔔 MESSAGE NOTIFICATION RECEIVED!');
        console.log('🔔 ========================================');
        console.log('📦 Notification data:', {
            workspaceId: notification.workspaceId,
            senderName: notification.senderName,
            messagePreview: notification.messagePreview,
            workspaceName: notification.workspaceName
        });
        console.log('📍 Current path:', currentPath);
        console.log('🎯 Chat route:', activeChatRoute);
        console.log('🔍 Is user on chat page?', currentPath === activeChatRoute);

        // Check if user is currently on the chat page for this workspace
        if (currentPath === activeChatRoute) {
            // User is ON the chat page.
            console.log('❌ SKIPPING NOTIFICATION - User is on chat page');
            console.log('🔔 ========================================\n');
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

        console.log('✅ SHOWING TOAST NOTIFICATION!');
        console.log('📝 Toast message:', `New message${workspaceText} from ${notification.senderName}`);
        console.log('🔔 ========================================\n');
        
        showInfoRef.current(`New message${workspaceText} from ${notification.senderName}`);
    }, []); // Empty deps - fully stable reference

    useEffect(() => {
        if (!socket) {
            console.log('⚠️ GlobalSocketListener: No socket connection');
            return;
        }

        console.log('\n🔌 ========================================');
        console.log('🔌 GLOBAL SOCKET LISTENER SETUP');
        console.log('🔌 ========================================');
        console.log('📍 Current path:', window.location.pathname);
        console.log('🆔 Socket ID:', socket.id);
        console.log('🔗 Socket connected:', socket.connected);
        console.log('✅ Listening for: message-notified events');
        console.log('🔌 ========================================\n');
        
        socket.on('message-notified', handleNewMessage);

        // Test listener is working - log all events to help debug
        const anyHandler = (eventName: string, ...args: any[]) => {
            if (eventName === 'message-notified') {
                console.log('🎯 RAW SOCKET EVENT RECEIVED:', eventName, args);
            }
        };
        socket.onAny(anyHandler);

        return () => {
            console.log('🔌 GlobalSocketListener: Removing message-notified listener');
            socket.off('message-notified', handleNewMessage);
            socket.offAny(anyHandler);
        };
    }, [socket, handleNewMessage]);

    return null;
}