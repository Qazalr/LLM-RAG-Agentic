"use client";

export default function LoadingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3" aria-label="Loading">
      <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" />
    </div>
  );
}
