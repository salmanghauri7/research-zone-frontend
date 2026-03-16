"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, memo, useCallback, lazy, Suspense } from "react";
import { sidebarItems } from "./sidebarItems";
import { logout } from "@/utils/logout";
import { motion } from "framer-motion";
import { useModal } from "@/contexts/ModalContext";
import { getCurrentWorkspaceId } from "@/utils/invitationStorage";
import { useWorkspaceStore } from "@/store/workspaceStore";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  LogOut,
  Layers,
} from "lucide-react";

// Lazy load WorkspaceSwitcher - it's a modal that's rarely used
const WorkspaceSwitcher = lazy(() => import("./WorkspaceSwitcher"));

const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [isWorkspaceSwitcherOpen, setIsWorkspaceSwitcherOpen] = useState(false);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(
    null,
  );
  const { openModal } = useModal();
  const { currentWorkspaceId: storeWorkspaceId } = useWorkspaceStore();

  useEffect(() => {
    const workspaceId = getCurrentWorkspaceId();
    setCurrentWorkspaceId(workspaceId);
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    await logout();
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const openWorkspaceSwitcher = useCallback(() => {
    setIsWorkspaceSwitcherOpen(true);
  }, []);

  const closeWorkspaceSwitcher = useCallback(() => {
    setIsWorkspaceSwitcherOpen(false);
  }, []);

  return (
    <aside
      className={`relative h-full flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 flex flex-col gap-3 border-b border-slate-200 dark:border-slate-800">
        {/* Workspace selector & collapse button */}
        <div className="flex items-center justify-between">
          <button
            onClick={openWorkspaceSwitcher}
            className={`flex items-center gap-2.5 overflow-hidden hover:bg-[var(--bg-hover)] rounded-lg px-2 py-1.5 -ml-1 transition-all group ${
              collapsed ? "justify-center w-full" : ""
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0 ">
              <Layers size={14} className="text-white" />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[var(--text-primary)] text-sm font-medium truncate group-hover:text-[var(--accent-primary)] transition-colors"
              >
                Workspaces
              </motion.span>
            )}
          </button>

          {!collapsed && (
            <button
              onClick={toggleCollapsed}
              className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={toggleCollapsed}
            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all mx-auto"
            title="Expand sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        {/* Create Workspace Button */}
        <button
          onClick={openModal}
          className={`flex items-center gap-2.5 rounded-xl border border-dashed border-[var(--border-secondary)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all duration-200 ${
            collapsed ? "p-2.5 justify-center" : "px-3 py-2.5"
          }`}
        >
          <Plus size={18} />
          {!collapsed && (
            <span className="text-sm font-medium">New Workspace</span>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col p-2 overflow-x-hidden overflow-y-auto custom-scrollbar">
        {sidebarItems.map((item) => {
          const dynamicHref =
            item.isDynamic && currentWorkspaceId
              ? item.href.replace(
                  "/workspace",
                  `/workspace/${currentWorkspaceId}`,
                )
              : item.href;

          // Check if this item should be active
          let isActive = pathname === dynamicHref;

          // Special handling for workspace main page - only Dashboard should be active
          if (
            item.label === "Dashboard" &&
            currentWorkspaceId &&
            pathname === `/workspace/${currentWorkspaceId}`
          ) {
            isActive = true;
          }

          return (
            <Link
              key={item.href}
              href={dynamicHref}
              prefetch={true}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative my-0.5 ${
                isActive
                  ? "bg-[var(--accent-subtle)] text-[var(--accent-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              } ${collapsed ? "justify-center px-2.5" : ""}`}
            >
              <span
                className={`text-lg shrink-0 ${
                  isActive ? "text-[var(--accent-primary)]" : ""
                }`}
              >
                {item.icon}
              </span>

              {!collapsed && (
                <span className="text-sm font-medium truncate">
                  {item.label}
                </span>
              )}

              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--accent-primary)] rounded-r-full" />
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-[var(--bg-elevated)] border border-slate-200 dark:border-slate-800  text-[var(--text-primary)] text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-3">
        <div
          className={`flex items-center gap-3 ${collapsed ? "flex-col" : ""}`}
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shrink-0 ">
            Z
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                zeeshan
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">Free plan</p>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-[var(--error-light)] transition-all ${
              collapsed ? "mt-2" : ""
            }`}
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Workspace Switcher Modal */}
      <Suspense fallback={null}>
        <WorkspaceSwitcher
          isOpen={isWorkspaceSwitcherOpen}
          onClose={closeWorkspaceSwitcher}
          collapsed={collapsed}
        />
      </Suspense>
    </aside>
  );
});

export default Sidebar;
