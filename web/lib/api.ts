import type { ChatRequest, ChatResponse } from "@/types";
import { getAuthHeaders } from "./auth";

const getBaseUrl = () =>
  (typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL
    : (typeof window !== "undefined" && (window as unknown as { __API_URL?: string }).__API_URL)) ||
  "";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function isNetworkError(e: unknown): boolean {
  if (e instanceof TypeError)
    return e.message === "Failed to fetch" || e.message === "Load failed";
  return false;
}

function toApiError(e: unknown, url: string): ApiError {
  if (e instanceof ApiError) return e;
  if (isNetworkError(e)) {
    return new ApiError(
      `Cannot reach the backend at ${url}. Check that the server is running and NEXT_PUBLIC_API_URL is correct. If the API is on another origin, enable CORS.`,
      undefined,
      undefined
    );
  }
  const message = e instanceof Error ? e.message : "Request failed";
  return new ApiError(message, undefined, undefined);
}

/**
 * Non-streaming: POST /api/chat, returns { reply: string }.
 */
export async function sendChatMessage(
  body: ChatRequest
): Promise<ChatResponse> {
  const base = getBaseUrl().replace(/\/$/, "");
  const url = `${base}/api/chat`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw toApiError(e, url);
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw new ApiError(
      `Request failed: ${res.status} ${res.statusText}`,
      res.status,
      body
    );
  }

  return res.json() as Promise<ChatResponse>;
}

/**
 * Streaming: POST /api/chat with Accept: text/event-stream or similar.
 * Yields chunks of text. Falls back to single reply if response is JSON.
 */
export async function* streamChatMessage(
  body: ChatRequest
): AsyncGenerator<string, void, unknown> {
  const base = getBaseUrl().replace(/\/$/, "");
  const url = `${base}/api/chat`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw toApiError(e, url);
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw new ApiError(
      `Request failed: ${res.status} ${res.statusText}`,
      res.status,
      body
    );
  }

  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = (await res.json()) as ChatResponse;
    if (data.reply) yield data.reply;
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    const text = await res.text();
    if (text) yield text;
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data) as { text?: string; content?: string; delta?: string };
            const chunk =
              parsed.text ?? parsed.content ?? parsed.delta ?? "";
            if (chunk) yield chunk;
          } catch {
            if (data) yield data;
          }
        }
      }
    }
    if (buffer.trim()) yield buffer;
  } finally {
    reader.releaseLock();
  }
}
