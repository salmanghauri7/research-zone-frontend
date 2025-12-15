"use client";

interface LoaderProps {
    variant?: "bounce" | "wave" | "pulse" | "scale";
}

export default function Loading() {
    return <Loader variant="bounce" />;
}

export function Loader({ variant = "bounce" }: LoaderProps) {
    return (
        <div className="fixed inset-0 bg-slate-900/20 dark:bg-slate-950/40 backdrop-blur-md flex items-center justify-center">
            {variant === "bounce" && <BounceDots />}
            {variant === "wave" && <WaveDots />}
            {variant === "pulse" && <PulseDots />}
            {variant === "scale" && <ScaleDots />}
        </div>
    );
}

function BounceDots() {
    return (
        <div className="flex items-end gap-3 h-20">
            <div
                className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/50 animate-bounce-smooth"
                style={{ animationDelay: "0ms" }}
            />
            <div
                className="w-4 h-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full shadow-lg shadow-purple-500/50 animate-bounce-smooth"
                style={{ animationDelay: "150ms" }}
            />
            <div
                className="w-4 h-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full shadow-lg shadow-pink-500/50 animate-bounce-smooth"
                style={{ animationDelay: "300ms" }}
            />
        </div>
    );
}

function WaveDots() {
    return (
        <div className="flex items-center gap-3 h-20">
            <div
                className="w-4 h-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full shadow-lg shadow-cyan-500/50 animate-wave"
                style={{ animationDelay: "0ms" }}
            />
            <div
                className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/50 animate-wave"
                style={{ animationDelay: "100ms" }}
            />
            <div
                className="w-4 h-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full shadow-lg shadow-indigo-500/50 animate-wave"
                style={{ animationDelay: "200ms" }}
            />
            <div
                className="w-4 h-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full shadow-lg shadow-purple-500/50 animate-wave"
                style={{ animationDelay: "300ms" }}
            />
            <div
                className="w-4 h-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full shadow-lg shadow-pink-500/50 animate-wave"
                style={{ animationDelay: "400ms" }}
            />
        </div>
    );
}

function PulseDots() {
    return (
        <div className="relative w-24 h-20 flex items-center justify-center">
            <div
                className="absolute w-3 h-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-lg shadow-emerald-500/50 animate-pulse-ring"
                style={{ animationDelay: "0ms" }}
            />
            <div
                className="absolute w-3 h-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg shadow-green-500/50 animate-pulse-ring"
                style={{ animationDelay: "200ms" }}
            />
            <div
                className="absolute w-3 h-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full shadow-lg shadow-teal-500/50 animate-pulse-ring"
                style={{ animationDelay: "400ms" }}
            />
        </div>
    );
}

function ScaleDots() {
    return (
        <div className="flex items-center gap-2 h-20">
            <div
                className="w-3 h-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-lg shadow-orange-500/50 animate-scale-smooth"
                style={{ animationDelay: "0ms" }}
            />
            <div
                className="w-3 h-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full shadow-lg shadow-amber-500/50 animate-scale-smooth"
                style={{ animationDelay: "100ms" }}
            />
            <div
                className="w-3 h-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full shadow-lg shadow-yellow-500/50 animate-scale-smooth"
                style={{ animationDelay: "200ms" }}
            />
            <div
                className="w-3 h-3 bg-gradient-to-br from-lime-500 to-lime-600 rounded-full shadow-lg shadow-lime-500/50 animate-scale-smooth"
                style={{ animationDelay: "300ms" }}
            />
            <div
                className="w-3 h-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg shadow-green-500/50 animate-scale-smooth"
                style={{ animationDelay: "400ms" }}
            />
        </div>
    );
}
