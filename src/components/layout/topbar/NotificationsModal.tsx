"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X, Check, Trash2, Bell } from "lucide-react";
import { notificationApi } from "@/api/notificationsApi";
import { useNotification, PanelNotification } from "@/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

interface NotificationsModalProps {
    onClose: () => void;
}

export default function NotificationsModal({ onClose }: NotificationsModalProps) {
    const [notifications, setNotifications] = useState<PanelNotification[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const loaderRef = useRef<HTMLDivElement>(null);

    const { markAsRead, dismissNotification, markAllAsRead } = useNotification();
    const router = useRouter();

    const fetchNotifications = useCallback(async (pageNum: number) => {
        try {
            setLoading(true);
            const res = await notificationApi.getNotifications({ page: pageNum, limit: 15 });
            const fetches = res?.data?.notifications || [];

            const mapped = fetches.map((n: any) => {
                // Fallback colors for avatar
                const colors = ["#7C3AED", "#0891B2", "#059669", "#DC2626", "#D97706", "#BE185D", "#6366F1", "#EC4899"];
                const avatarColor = colors[Math.floor(Math.random() * colors.length)];
                const name = n.senderId?.username || n.senderId?.name || "User";
                const avatar = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

                return {
                    id: n._id,
                    user: name,
                    avatar,
                    avatarColor,
                    workspace: n.workspaceId?.name || "Workspace",
                    workspaceId: n.workspaceId?._id || n.workspaceId,
                    messageId: n.messageId?._id || n.messageId,
                    message: n.content || "New message",
                    time: new Date(n.createdAt).toLocaleDateString() + " " + new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    read: n.isRead,
                    type: "message",
                    createdAt: new Date(n.createdAt),
                };
            });

            setNotifications((prev) => (pageNum === 1 ? mapped : [...prev, ...mapped]));
            setHasMore(mapped.length === 15);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications(1);
    }, [fetchNotifications]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const target = entries[0];
            if (target.isIntersecting && hasMore && !loading) {
                setPage((prev) => {
                    const next = prev + 1;
                    fetchNotifications(next);
                    return next;
                });
            }
        });

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [hasMore, loading, fetchNotifications]);

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        markAsRead(id);
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        dismissNotification(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const handleMarkAllAsRead = async () => {
        // Optimistic update
        const unreadLocalIds = notifications.filter(n => !n.read).map(n => n.id);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

        // Also notify global context just in case
        markAllAsRead();

        // Call update API for all unread ids shown
        try {
            if (unreadLocalIds.length > 0) {
                await Promise.all(unreadLocalIds.map(id => notificationApi.markAsRead(id)));
            }
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleNotificationClick = (notif: PanelNotification) => {
        if (!notif.read) handleMarkAsRead(notif.id, { stopPropagation: () => { } } as any);

        if (notif.workspaceId) {
            onClose();
            const chatUrl = notif.messageId
                ? `/workspace/${notif.workspaceId}/chat?messageId=${notif.messageId}`
                : `/workspace/${notif.workspaceId}/chat`;
            router.push(chatUrl);
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in p-4 lg:p-8"
            onClick={onClose}
        >
            <div
                className="bg-[var(--bg-elevated)] w-full max-w-3xl h-[85vh] min-h-[500px] max-h-[800px] flex flex-col rounded-2xl border border-[var(--border-primary)] shadow-2xl relative"
                style={{ animation: "dropIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-primary)]">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">All Notifications</h2>
                        <p className="text-[13px] text-[var(--text-tertiary)] mt-1">Review your recent activity and messages</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {notifications.some(n => !n.read) && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-[13px] font-medium text-[var(--accent-primary)] hover:bg-[var(--bg-hover)] px-3 py-2 rounded-lg transition-colors border border-[var(--accent-primary)]/20"
                            >
                                Mark all as read
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-2">
                    {notifications.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-tertiary)] h-full">
                            <div className="w-16 h-16 bg-[var(--bg-tertiary)] flex items-center justify-center rounded-full mb-4">
                                <Bell size={32} className="opacity-60" />
                            </div>
                            <span className="text-[15px] font-medium text-[var(--text-secondary)]">No notifications to show</span>
                            <span className="text-[13px] mt-1">You're all caught up!</span>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 pt-2">
                        {notifications.map((n, i) => (
                            <div
                                key={`${n.id}-${i}`}
                                onClick={() => handleNotificationClick(n)}
                                className={`flex gap-4 p-4 rounded-xl cursor-pointer transition-colors group border ${n.read
                                    ? "bg-transparent border-transparent hover:bg-[var(--bg-hover)] opacity-80"
                                    : "bg-[var(--accent-subtle)] border-[var(--accent-primary)]/20 hover:bg-[var(--accent-subtle)]/80"
                                    }`}
                            >
                                {/* Avatar */}
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0 relative overflow-hidden"
                                    style={{ background: n.avatarColor }}
                                >
                                    {n.avatar}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[14px] font-semibold text-[var(--text-primary)]">
                                            {n.user}
                                            <span className="text-[var(--text-tertiary)] font-normal ml-2 text-[12px]">• {n.workspace}</span>
                                        </span>
                                        <span className="text-[12px] text-[var(--text-tertiary)]">{n.time}</span>
                                    </div>
                                    <p className="text-[13.5px] text-[var(--text-secondary)] mt-1 break-words">{n.message}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!n.read && (
                                        <button
                                            onClick={(e) => handleMarkAsRead(n.id, e)}
                                            title="Mark as read"
                                            className="p-1.5 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-md transition-colors"
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => handleDelete(n.id, e)}
                                        title="Delete notification"
                                        className="p-1.5 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-md transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Unread indicator mobile fallback */}
                                {!n.read && <div className="absolute top-[30px] right-2 w-2 h-2 rounded-full bg-[var(--accent-primary)] group-hover:hidden" />}
                            </div>
                        ))}
                    </div>

                    {/* Skeletons loader */}
                    {(loading || hasMore) && (
                        <div ref={loaderRef} className="flex flex-col gap-2 pt-2 py-4">
                            {[...Array(loading ? 5 : 1)].map((_, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl bg-[var(--bg-tertiary)]/50 animate-pulse border border-transparent">
                                    <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex-shrink-0" />
                                    <div className="flex-1 py-1">
                                        <div className="flex justify-between mb-2">
                                            <div className="h-3 w-1/4 bg-[var(--bg-elevated)] rounded" />
                                            <div className="h-2 w-16 bg-[var(--bg-elevated)] rounded" />
                                        </div>
                                        <div className="h-3 w-3/4 bg-[var(--bg-elevated)] rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <style jsx>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(15px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
        </div>,
        document.body
    );
}
