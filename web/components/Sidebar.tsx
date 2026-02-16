"use client";

import type { Conversation } from "@/types";

interface SidebarProps {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  conversations,
  currentId,
  onSelect,
  onNewChat,
  onDelete,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border)]
          flex flex-col
          transform transition-transform duration-200 ease-out
          lg:translate-x-0 lg:static lg:z-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium transition-colors"
          >
            <span className="text-lg">+</span>
            New chat
          </button>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm px-2 py-4 text-center">
              No conversations yet
            </p>
          ) : (
            <ul className="space-y-0.5">
              {conversations.map((c) => (
                <li key={c.id}>
                  <div className="group flex items-center gap-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                    <button
                      onClick={() => onSelect(c.id)}
                      className={`flex-1 text-left px-3 py-2.5 text-sm truncate rounded-lg ${
                        currentId === c.id
                          ? "bg-black/10 dark:bg-white/10 font-medium"
                          : ""
                      }`}
                    >
                      {c.title || "New chat"}
                    </button>
                    <button
                      onClick={(e) => onDelete(c.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-muted)] text-xs transition-opacity"
                      aria-label="Delete conversation"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </aside>
    </>
  );
}
