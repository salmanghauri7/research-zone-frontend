import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  MessageSquare,
  Sparkles,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: ReactNode;
  isDynamic?: boolean;
}

export const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={20} />,
    isDynamic: true,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: <FolderKanban size={20} />,
  },
  {
    label: "Papers",
    href: "/papers",
    icon: <FileText size={20} />,
  },
  {
    label: "Team Chat",
    href: "/workspace/chat",
    icon: <MessageSquare size={20} />,
    isDynamic: true,
  },
  {
    label: "AI Tools",
    href: "/ai-tools",
    icon: <Sparkles size={20} />,
  },
  {
    label: "Settings",
    href: "/workspace/settings",
    icon: <Settings size={20} />,
    isDynamic: true,
  },
];
