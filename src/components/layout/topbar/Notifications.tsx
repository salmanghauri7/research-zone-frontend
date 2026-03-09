"use client";

import { useState, useRef, useEffect, memo, useMemo } from "react";
import { Bell } from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import type { PanelNotification } from "@/contexts/NotificationContext";

type NotificationType = "message" | "share" | "comment" | "invite" | "success" | "error" | "info";

const typeIcons: Record<NotificationType, JSX.Element> = {
  message: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  share: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  comment: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  invite: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  ),
  success: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  error: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
  ),
  info: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  ),
};

const typeColors: Record<NotificationType, string> = {
  message: "#10B981",
  share: "#6366F1",
  comment: "#F59E0B",
  invite: "#EC4899",
  success: "#10B981",
  error: "#DC2626",
  info: "#0891B2",
};

const TRUNCATE_LENGTH = 90;

function truncateText(str: string): { text: string; truncated: boolean } {
  if (str.length <= TRUNCATE_LENGTH) return { text: str, truncated: false };
  return { text: str.slice(0, TRUNCATE_LENGTH).trimEnd() + "…", truncated: true };
}

const Notifications = memo(function Notifications() {
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const notifRef = useRef<HTMLDivElement>(null);
  const notifButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const {
    panelNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useNotification();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node) &&
        notifButtonRef.current &&
        !notifButtonRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleNotifications = () => {
    setNotifOpen((prev) => !prev);
  };

  const handleNotificationClick = (notif: PanelNotification) => {
    markAsRead(notif.id);
    
    // If notification has a workspaceId, navigate to that workspace chat
    if (notif.workspaceId) {
      // Build URL with messageId query param if available
      const chatUrl = notif.messageId 
        ? `/workspace/${notif.workspaceId}/chat?messageId=${notif.messageId}`
        : `/workspace/${notif.workspaceId}/chat`;
      
      router.push(chatUrl);
      setNotifOpen(false);
    }
  };

  const filteredNotifs = useMemo(() => {
    return panelNotifications.filter((n) => (filter === "unread" ? !n.read : true));
  }, [panelNotifications, filter]);

  return (
    <div className="relative">
      <button
        ref={notifButtonRef}
        className={`p-2 rounded-lg transition-all relative ${
          notifOpen
            ? "text-[var(--accent-primary)] bg-[var(--bg-hover)]"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        }`}
        title="Notifications"
        onClick={toggleNotifications}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-[var(--accent-primary)] text-white text-[9px] font-bold rounded-full border-[1.5px] border-[var(--bg-secondary)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {notifOpen && (
        <div
          ref={notifRef}
          className="absolute top-[calc(100%+10px)] right-0 w-[380px] bg-[var(--bg-elevated)] border border-[var(--border-primary)] shadow-2xl rounded-xl overflow-hidden z-[999] animate-fade-in"
          style={{
            animation: "dropIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-[18px] py-4 pb-3 border-b border-[var(--border-primary)]">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-[var(--text-primary)]">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-[var(--accent-subtle)] text-[var(--accent-primary)] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[var(--accent-primary)]/25">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                className="text-[12px] font-medium text-[var(--accent-primary)] hover:bg-[var(--bg-hover)] px-2 py-1 rounded-md transition-colors"
                onClick={markAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-0 px-[18px] pt-2.5 border-b border-[var(--border-primary)]">
            {(["all", "unread"] as const).map((tab) => (
              <button
                key={tab}
                className={`text-[13px] font-medium px-3 py-1.5 pb-2.5 mb-[-1px] border-b-2 transition-colors capitalize ${
                  filter === tab
                    ? "text-[var(--accent-primary)] border-[var(--accent-primary)]"
                    : "text-[var(--text-tertiary)] border-transparent hover:text-[var(--text-secondary)]"
                }`}
                onClick={() => setFilter(tab)}
              >
                {tab === "all" ? "All" : `Unread (${unreadCount})`}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto">
            {filteredNotifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-5 text-[var(--text-tertiary)]">
                <Bell size={32} className="mb-2.5 opacity-50" />
                <span className="text-[13px]">You're all caught up!</span>
              </div>
            ) : (
              filteredNotifs.map((n, i) => {
                const { text, truncated } = truncateText(n.message);
                const isExpanded = expanded[n.id];
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-[18px] py-3.5 border-b border-[var(--border-secondary)] cursor-pointer transition-colors group ${
                      n.read
                        ? "opacity-75 hover:bg-[var(--bg-hover)]"
                        : "bg-[var(--accent-subtle)]/30 hover:bg-[var(--accent-subtle)]/50"
                    }`}
                    style={{
                      animation: `fadeSlide 0.25s ease forwards`,
                      animationDelay: `${i * 40}ms`,
                      opacity: 0,
                    }}
                    onClick={() => handleNotificationClick(n)}
                  >
                    {/* Unread Dot */}
                    {!n.read && (
                      <div className="absolute left-1.5 top-[22px] w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                    )}

                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0 relative ml-1.5"
                      style={{ background: n.avatarColor }}
                    >
                      {n.avatar}
                      <div
                        className="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-md flex items-center justify-center text-white border-2 border-[var(--bg-elevated)]"
                        style={{ background: typeColors[n.type] }}
                      >
                        {typeIcons[n.type]}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                          {n.user}
                        </span>
                        <span className="text-[11px] text-[var(--text-tertiary)] flex-shrink-0 ml-2 font-mono">
                          {n.time}
                        </span>
                      </div>
                      <div className="inline-flex items-center text-[11px] text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded px-1.5 py-0.5 mb-1.5 font-medium">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1"
                        >
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                        {n.workspace}
                      </div>
                      <p className="text-[12.5px] text-[var(--text-secondary)] leading-[1.55]">
                        {isExpanded ? n.message : text}
                        {truncated && !isExpanded && (
                          <button
                            className="text-[var(--accent-primary)] font-medium ml-1 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpanded((prev) => ({ ...prev, [n.id]: true }));
                            }}
                          >
                            see more
                          </button>
                        )}
                      </p>
                    </div>

                    {/* Dismiss Button */}
                    <button
                      className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all mt-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(n.id);
                      }}
                      title="Dismiss"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {filteredNotifs.length > 0 && (
            <div className="px-[18px] py-2.5 border-t border-[var(--border-primary)] flex justify-center">
              <button className="w-full text-[12.5px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] px-5 py-2 rounded-lg transition-all">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes dropIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateX(6px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
});

export default Notifications;
