export default function DashboardLoading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
            <div className="flex flex-col items-center gap-4">
                {/* Spinner */}
                <div className="relative w-16 h-16">
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800"></div>
                    {/* Animated ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-500 animate-spin"></div>
                </div>
                
                {/* Loading text */}
                <div className="flex items-center gap-2">
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        Loading
                    </span>
                    <div className="flex gap-1">
                        <span className="animate-bounce [animation-delay:-0.3s] text-gray-700 dark:text-gray-300">.</span>
                        <span className="animate-bounce [animation-delay:-0.15s] text-gray-700 dark:text-gray-300">.</span>
                        <span className="animate-bounce text-gray-700 dark:text-gray-300">.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
