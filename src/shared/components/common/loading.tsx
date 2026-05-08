"use client";

interface LoaderProps {
  variant?: "bounce" | "wave" | "pulse" | "scale";
}

export default function Loading() {
  return <Loader variant="bounce" />;
}

export function Loader({ variant = "bounce" }: LoaderProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-md dark:bg-slate-950/40">
      {variant === "bounce" && <BounceDots />}
      {variant === "wave" && <WaveDots />}
      {variant === "pulse" && <PulseDots />}
      {variant === "scale" && <ScaleDots />}
    </div>
  );
}

function BounceDots() {
  return (
    <div className="flex h-20 items-end gap-3">
      <div
        className="h-4 w-4 animate-bounce-smooth rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="h-4 w-4 animate-bounce-smooth rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/50"
        style={{ animationDelay: "150ms" }}
      />
      <div
        className="h-4 w-4 animate-bounce-smooth rounded-full bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg shadow-pink-500/50"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

function WaveDots() {
  return (
    <div className="flex h-20 items-center gap-3">
      <div
        className="h-4 w-4 animate-wave rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/50"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="h-4 w-4 animate-wave rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50"
        style={{ animationDelay: "100ms" }}
      />
      <div
        className="h-4 w-4 animate-wave rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/50"
        style={{ animationDelay: "200ms" }}
      />
      <div
        className="h-4 w-4 animate-wave rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/50"
        style={{ animationDelay: "300ms" }}
      />
      <div
        className="h-4 w-4 animate-wave rounded-full bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg shadow-pink-500/50"
        style={{ animationDelay: "400ms" }}
      />
    </div>
  );
}

function PulseDots() {
  return (
    <div className="relative flex h-20 w-24 items-center justify-center">
      <div
        className="absolute h-3 w-3 animate-pulse-ring rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/50"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="absolute h-3 w-3 animate-pulse-ring rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/50"
        style={{ animationDelay: "200ms" }}
      />
      <div
        className="absolute h-3 w-3 animate-pulse-ring rounded-full bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/50"
        style={{ animationDelay: "400ms" }}
      />
    </div>
  );
}

function ScaleDots() {
  return (
    <div className="flex h-20 items-center gap-2">
      <div
        className="h-3 w-3 animate-scale-smooth rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/50"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="h-3 w-3 animate-scale-smooth rounded-full bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/50"
        style={{ animationDelay: "100ms" }}
      />
      <div
        className="h-3 w-3 animate-scale-smooth rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/50"
        style={{ animationDelay: "200ms" }}
      />
      <div
        className="h-3 w-3 animate-scale-smooth rounded-full bg-gradient-to-br from-lime-500 to-lime-600 shadow-lg shadow-lime-500/50"
        style={{ animationDelay: "300ms" }}
      />
      <div
        className="h-3 w-3 animate-scale-smooth rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/50"
        style={{ animationDelay: "400ms" }}
      />
    </div>
  );
}
