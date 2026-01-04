import { ReactNode } from "react";

export default function GeneralLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {children}
        </div>
    );
}
