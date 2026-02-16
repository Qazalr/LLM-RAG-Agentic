/**
 * Placeholder token-based auth.
 * In production, replace with real auth (e.g. NextAuth, Clerk, or your backend session).
 */

const TOKEN_KEY = "agent_rag_api_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const token =
    typeof process !== "undefined"
      ? (process.env.NEXT_PUBLIC_API_TOKEN as string | undefined)
      : null;
  const stored = getToken();
  const t = token || stored;
  if (!t) return {};
  return { Authorization: `Bearer ${t}` };
}
