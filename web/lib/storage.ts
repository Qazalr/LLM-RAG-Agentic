export interface StoredMessage {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY_PREFIX = "chatable_conv_";
const RECENT_CHATS_KEY = "chatable_recent_chats";

export function saveConversation(id: string, messages: StoredMessage[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${id}`, JSON.stringify(messages));
  updateRecentChats(id, messages);
}

export function loadConversation(id: string): StoredMessage[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
  return stored ? JSON.parse(stored) : [];
}

export function getConversationHistory(): { id: string; title: string, date: number }[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(RECENT_CHATS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function clearConversation(id: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
  // Also remove from recent list logic if needed
}

function updateRecentChats(id: string, messages: StoredMessage[]) {
  const history = getConversationHistory();
  const existingIndex = history.findIndex(h => h.id === id);

  // Generate a title from the first user message
  const firstUserMsg = messages.find(m => m.role === 'user');
  const title = firstUserMsg ? firstUserMsg.content.slice(0, 30) : "New Chat";

  const newItem = { id, title, date: Date.now() };

  if (existingIndex >= 0) {
    history[existingIndex] = newItem;
  } else {
    history.unshift(newItem);
  }

  localStorage.setItem(RECENT_CHATS_KEY, JSON.stringify(history.slice(0, 20))); // Keep last 20
}
