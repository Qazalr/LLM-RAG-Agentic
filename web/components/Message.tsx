"use client";

import type { Message as MessageType } from "@/types";
import MessageContent from "./MessageContent";

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} px-4 py-3`}
      data-message-id={message.id}
    >
      <div
        className={`max-w-[85%] lg:max-w-[min(70%,48rem)] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-[var(--user-msg-bg)] text-[var(--text)]"
            : "bg-transparent text-[var(--text)]"
        }`}
      >
        <div className="text-sm whitespace-pre-wrap">
          <MessageContent content={message.content} />
        </div>
      </div>
    </div>
  );
}
