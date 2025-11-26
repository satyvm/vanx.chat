"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { listChats, type ChatSummary } from "@/lib/api/chat";

interface ChatListContextValue {
  chats: ChatSummary[];
  activeChatId?: string;
  isLoading: boolean;
  error?: string | null;
  refreshChats: () => Promise<void>;
  setActiveChatId: (chatId?: string) => void;
}

export const ChatListContext = createContext<ChatListContextValue | null>(null);

export function ChatListProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshChats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listChats();
      setChats(data);
      setError(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load chats";
      setChats([]);
      setError(message);
      if (process.env.NODE_ENV === "development") {
        console.warn("Chat list fetch failed:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshChats();
  }, [refreshChats]);

  return (
    <ChatListContext.Provider
      value={{
        chats,
        activeChatId,
        isLoading,
        error,
        refreshChats,
        setActiveChatId,
      }}
    >
      {children}
    </ChatListContext.Provider>
  );
}

export function useChatList() {
  const context = useContext(ChatListContext);
  if (!context) {
    throw new Error("useChatList must be used within a ChatListProvider");
  }
  return context;
}
