export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  parts: { type: 'text'; text: string }[];
}
export interface ChatThread {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
}

const KEY = 'comoencasa-asistente';

export function loadThreads(): ChatThread[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function saveThreads(threads: ChatThread[]) {
  localStorage.setItem(KEY, JSON.stringify(threads));
}

export function getThread(id: string) {
  return loadThreads().find((t) => t.id === id);
}

export function upsertThread(thread: ChatThread) {
  const rest = loadThreads().filter((t) => t.id !== thread.id);
  saveThreads([thread, ...rest].sort((a, b) => b.updatedAt - a.updatedAt));
}

export function deleteThread(id: string) {
  saveThreads(loadThreads().filter((t) => t.id !== id));
}

export function newThreadId() {
  return crypto.randomUUID().slice(0, 8);
}

export const textOf = (m: ChatMessage) => m.parts.map((p) => p.text).join('');
