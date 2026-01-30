"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { sidebarItems } from "./sidebarItems";
import { LuListCollapse } from "react-icons/lu";
import { FiLogOut } from "react-icons/fi";
import { logout } from "@/utils/logout";
import { motion } from "framer-motion";
import { useModal } from "@/contexts/ModalContext";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [isWorkspaceSwitcherOpen, setIsWorkspaceSwitcherOpen] = useState(false);
  const { openModal } = useModal();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="relative h-full flex flex-col border-r border-gray-200 dark:border-white/10 bg-white dark:bg-black">
      {/* Sidebar Header */}
      <motion.div
        layout
        className="p-4 flex flex-col gap-4 border-b border-gray-200 dark:border-white/10"
      >
        <div className="flex items-center justify-between h-6">
          <button
            onClick={() => setIsWorkspaceSwitcherOpen(true)}
            className="flex items-center gap-2 pl-1 overflow-hidden hover:bg-gray-100 dark:hover:bg-white/5 rounded-md px-2 py-1 -ml-2 transition-colors group"
          >
            <span className="w-3 h-3 bg-blue-500 rounded-full shrink-0 group-hover:scale-110 transition-transform"></span>
            <motion.p
              layout
              initial={{ opacity: 0, width: 0 }}
              animate={{
                opacity: collapsed ? 0 : 1,
                width: collapsed ? 0 : "auto",
              }}
              transition={{ duration: 0.3 }}
              className="text-black/80 dark:text-white/80 text-sm font-medium whitespace-nowrap group-hover:text-black dark:group-hover:text-white"
            >
              Workspaces
            </motion.p>
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
          >
            <motion.span
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="block text-xl"
            >
              <LuListCollapse />
            </motion.span>
          </button>
        </div>

        {/* Create Workspace Button */}
        <motion.button
          layout
          onClick={openModal}
          className="flex items-center border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors duration-200 py-2 overflow-hidden"
        >
          <div className="w-12 flex justify-center shrink-0">
            <span className="text-2xl leading-none pb-1">+</span>
          </div>
          <motion.span
            layout
            initial={{ opacity: 0, width: 0 }}
            animate={{
              opacity: collapsed ? 0 : 1,
              width: collapsed ? 0 : "auto",
            }}
            transition={{ duration: 0.3 }}
            className="whitespace-nowrap"
          >
            Create Workspace
          </motion.span>
        </motion.button>
      </motion.div>

      {/* Navigation */}
      { }
      <nav className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto custom-scrollbar">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center mx-2 my-1 p-2 rounded-md transition-colors duration-200 group relative ${isActive
                ? "bg-gray-100 dark:bg-white/10 text-black dark:text-white"
                : "text-black/70 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
            >
              <div className="min-w-12 flex justify-center items-center">
                <span className="text-xl">{item.icon}</span>
              </div>

              <motion.span
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: collapsed ? 0 : 1,
                  x: collapsed ? 20 : 0,
                  width: collapsed ? 0 : "auto",
                }}
                transition={{ duration: 0.3 }}
                className="ml-2 whitespace-nowrap overflow-hidden"
              >
                {item.label}
              </motion.span>

              {/* Tooltip for collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-black dark:bg-white text-white dark:text-black text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile Section */}
      <motion.div
        layout
        className={`border-t border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4 flex items-center shrink-0 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold shrink-0">
              Z
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-md transition-colors"
              title="Logout"
            >
              <FiLogOut className="text-lg" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold shrink-0">
              Z
            </div>

            <div className="flex flex-col overflow-hidden ml-3 flex-1">
              <p className="text-sm font-medium text-black dark:text-white">
                zeeshan
              </p>
              <p className="text-xs text-gray-500 dark:text-white/50">Free</p>
            </div>

            <button
              onClick={handleLogout}
              className="ml-2 p-2 bg-red-500/10 hover:bg-red-500/20 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-md transition-colors"
              title="Logout"
            >
              <FiLogOut className="text-lg" />
            </button>
          </>
        )}
      </motion.div>

      {/* Workspace Switcher Modal */}
      <WorkspaceSwitcher
        isOpen={isWorkspaceSwitcherOpen}
        onClose={() => setIsWorkspaceSwitcherOpen(false)}
        collapsed={collapsed}
      />
    </aside>
  );
}
