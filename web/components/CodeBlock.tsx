"use client";

import { useState, useCallback } from "react";

interface CodeBlockProps {
  language?: string;
  children: string;
}

export default function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(children.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [children]);

  return (
    <div className="relative group">
      {language && (
        <span className="absolute top-2 right-10 text-xs text-[var(--text-muted)]">
          {language}
        </span>
      )}
      <button
        type="button"
        onClick={copy}
        className="absolute top-2 right-2 p-1.5 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-muted)] text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy code"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre className="p-4 pr-24 overflow-x-auto text-sm">
        <code>{children}</code>
      </pre>
    </div>
  );
}
