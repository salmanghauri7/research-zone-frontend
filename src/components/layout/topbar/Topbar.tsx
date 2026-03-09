"use client";

import { useState, useRef, useEffect, memo, useCallback, useMemo } from "react";
import { Sun, Moon, Monitor, LogOut, Search, Bell } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { logout } from "@/utils/logout";

type ThemeOption = "light" | "dark" | "system";

type NotificationType = "message" | "share" | "comment" | "invite";

interface Notification {
  id: number;
  user: string;
  avatar: string;
  avatarColor: string;
  workspace: string;
  message: string;
  time: string;
  read: boolean;
  type: NotificationType;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    user: "Sarah Chen",
    avatar: "SC",
    avatarColor: "#7C3AED",
    workspace: "ML Research 2024",
    message: "Hey team, I've finished the literature review for the transformer architecture section. Can someone cross-check the citations before we submit?",
    time: "2m ago",
    read: false,
    type: "message",
  },
  {
    id: 2,
    user: "James Okafor",
    avatar: "JO",
    avatarColor: "#0891B2",
    workspace: "research",
    message: "Added 3 new papers on diffusion models 🔬",
    time: "18m ago",
    read: false,
    type: "message",
  },
  {
    id: 3,
    user: "Priya Nair",
    avatar: "PN",
    avatarColor: "#059669",
    workspace: "NLP Corpus Study",
    message: "The dataset preprocessing script is throwing an error on line 47. I think there's an encoding mismatch — can anyone look into it before our 3pm sync?",
    time: "1h ago",
    read: false,
    type: "message",
  },
  {
    id: 4,
    user: "Marcus Webb",
    avatar: "MW",
    avatarColor: "#DC2626",
    workspace: "research",
    message: "Shared a new paper: 'Attention Is All You Need — Revisited'",
    time: "3h ago",
    read: true,
    type: "share",
  },
  {
    id: 5,
    user: "Aiko Tanaka",
    avatar: "AT",
    avatarColor: "#D97706",
    workspace: "ML Research 2024",
    message: "Left a comment on your annotation for Paper #12.",
    time: "Yesterday",
    read: true,
    type: "comment",
  },
  {
    id: 6,
    user: "Leo Ferreira",
    avatar: "LF",
    avatarColor: "#BE185D",
    workspace: "Quantum Computing Notes",
    message: "Invited you to collaborate on a new workspace.",
    time: "2 days ago",
    read: true,
    type: "invite",
  },
];

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
};

const typeColors: Record<NotificationType, string> = {
  message: "#10B981",
  share: "#6366F1",
  comment: "#F59E0B",
  invite: "#EC4899",
};

const TRUNCATE_LENGTH = 90;

function truncateText(str: string): { text: string; truncated: boolean } {
  if (str.length <= TRUNCATE_LENGTH) return { text: str, truncated: false };
  return { text: str.slice(0, TRUNCATE_LENGTH).trimEnd() + "…", truncated: true };
}

const Topbar = memo(function Topbar() {
  const [themeMenuOpen, setThemeMenuOpen] = useState<boolean>(false);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const [notifs, setNotifs] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const themeRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const notifButtonRef = useRef<HTMLButtonElement>(null);

  const { theme, setTheme, mounted } = useTheme();

  const unreadCount = useMemo(() => notifs.filter((n) => !n.read).length, [notifs]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        themeRef.current &&
        !themeRef.current.contains(event.target as Node)
      ) {
        setThemeMenuOpen(false);
      }
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

  const handleThemeSelect = useCallback(
    (selectedTheme: ThemeOption) => {
      setTheme(selectedTheme);
      setThemeMenuOpen(false);
    },
    [setTheme],
  );

  const toggleThemeMenu = useCallback(() => {
    setThemeMenuOpen((prev) => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, []);

  const toggleNotifications = useCallback(() => {
    setNotifOpen((prev) => !prev);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifs((n) => n.map((x) => ({ ...x, read: true })));
  }, []);

  const markRead = useCallback((id: number) => {
    setNotifs((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
  }, []);

  const dismiss = useCallback((id: number) => {
    setNotifs((n) => n.filter((x) => x.id !== id));
  }, []);

  const filteredNotifs = useMemo(() => {
    return notifs.filter((n) => (filter === "unread" ? !n.read : true));
  }, [notifs, filter]);

  const ThemeIcon = useMemo(() => {
    if (!mounted) return <Sun size={18} />;
    if (theme === "light") return <Sun size={18} />;
    if (theme === "dark") return <Moon size={18} />;
    return <Monitor size={18} />;
  }, [theme, mounted]);

  const themeOptions: {
    value: ThemeOption;
    label: string;
    icon: React.ReactNode;
  }[] = [
      { value: "light", label: "Light", icon: <Sun size={16} /> },
      { value: "dark", label: "Dark", icon: <Moon size={16} /> },
      { value: "system", label: "System", icon: <Monitor size={16} /> },
    ];

  return (
    <header className="w-full h-14 fixed top-0 left-0 z-10 bg-[var(--bg-secondary)]/80 backdrop-blur-xl px-4 flex items-center justify-between border-b border-[var(--border-primary)]">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          R
        </div>
        <span className="text-[var(--text-primary)] text-lg font-semibold tracking-tight">
          ResearchZone
        </span>
      </div>

      {/* Center: Search (optional - hidden on mobile) */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
          />
          <input
            type="text"
            placeholder="Search papers, projects..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <div className="relative">
          <button
            ref={notifButtonRef}
            className={`p-2 rounded-lg transition-all relative ${notifOpen
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
                    onClick={markAllRead}
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
                    className={`text-[13px] font-medium px-3 py-1.5 pb-2.5 mb-[-1px] border-b-2 transition-colors capitalize ${filter === tab
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
                        className={`flex items-start gap-3 px-[18px] py-3.5 border-b border-[var(--border-secondary)] cursor-pointer transition-colors group ${n.read
                            ? "opacity-75 hover:bg-[var(--bg-hover)]"
                            : "bg-[var(--accent-subtle)]/30 hover:bg-[var(--accent-subtle)]/50"
                          }`}
                        style={{
                          animation: `fadeSlide 0.25s ease forwards`,
                          animationDelay: `${i * 40}ms`,
                          opacity: 0,
                        }}
                        onClick={() => markRead(n.id)}
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
                            dismiss(n.id);
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
              <div className="px-[18px] py-2.5 border-t border-[var(--border-primary)] flex justify-center">
                <button className="w-full text-[12.5px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] px-5 py-2 rounded-lg transition-all">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Dropdown */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={toggleThemeMenu}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
            title="Theme"
          >
            {ThemeIcon}
          </button>

          {themeMenuOpen && (
            <div className="absolute right-0 mt-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] shadow-xl rounded-xl w-36 p-1.5 animate-fade-in">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleThemeSelect(option.value)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-left transition-all text-sm ${theme === option.value
                      ? "bg-[var(--accent-subtle)] text-[var(--accent-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                    }`}
                >
                  {option.icon}
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[var(--border-primary)] mx-1" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-[var(--error-light)] transition-all"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>

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
    </header>
  );
});

export default Topbar;
