import type { UIMessage } from "ai";
import { apiFetch } from "@/lib/utils/fetcher";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ChatSummary {
  id: string;
  title: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatDetail extends ChatSummary {
  messages: UIMessage[];
}

export async function listChats(): Promise<ChatSummary[]> {
  return apiFetch<ChatSummary[]>(`${BASE_URL}/chat`);
}

export async function fetchChat(id: string): Promise<ChatDetail> {
  return apiFetch<ChatDetail>(`${BASE_URL}/chat/${id}`);
}

export async function createChat(payload: {
  title?: string;
  messages?: UIMessage[];
}): Promise<{ id: string }> {
  return apiFetch<{ id: string }>(`${BASE_URL}/chat/start`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}
