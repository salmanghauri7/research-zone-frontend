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
    label: "Workspace Overview",
    href: "/workspace",
    icon: <LayoutDashboard size={20} />,
    isDynamic: true,
  },
  {
    label: "Saved Papers",
    href: "/workspace/saved-papers",
    icon: <FolderKanban size={20} />,
    isDynamic: true,
  },
  {
    label: "Search Papers",
    href: "/workspace/search-papers",
    icon: <FileText size={20} />,
    isDynamic: true,
  },
  {
    label: "Team Chat",
    href: "/workspace/chat",
    icon: <MessageSquare size={20} />,
    isDynamic: true,
  },
  {
    label: "Paper Chat",
    href: "/workspace/paper-chat",
    icon: <Sparkles size={20} />,
    isDynamic: true,
  },
  {
    label: "Settings",
    href: "/workspace/settings",
    icon: <Settings size={20} />,
    isDynamic: true,
  },
];
