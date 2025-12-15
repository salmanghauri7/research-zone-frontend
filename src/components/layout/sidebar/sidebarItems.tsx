import { FiHome, FiFolder, FiFileText, FiMessageCircle, FiCpu } from "react-icons/fi";

export const sidebarItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: <FiHome />
    },
    {
        label: "My Projects",
        href: "/projects",
        icon: <FiFolder />
    },
    {
        label: "Paper Library",
        href: "/papers",
        icon: <FiFileText />
    },
    {
        label: "Team Chat",
        href: "/chat",
        icon: <FiMessageCircle />
    },
    {
        label: "AI Research Tools",
        href: "/ai-tools",
        icon: <FiCpu />
    },
];
