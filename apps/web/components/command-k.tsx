"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Plus } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@vanx/ui/components/command";
import { ChatListContext } from "@/components/chat-list-provider";

const CommandKContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

function useChatListSafe() {
  const context = React.useContext(ChatListContext);
  return context;
}

export function CommandKProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const router = useRouter();
  const chatListContext = useChatListSafe();

  const chats = React.useMemo(
    () => chatListContext?.chats ?? [],
    [chatListContext?.chats],
  );
  const setActiveChatId = chatListContext?.setActiveChatId;

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filteredChats = React.useMemo(() => {
    if (!search.trim()) {
      return chats;
    }
    const searchLower = search.toLowerCase();
    return chats.filter(
      (chat) =>
        chat.title.toLowerCase().includes(searchLower) ||
        chat.description?.toLowerCase().includes(searchLower),
    );
  }, [chats, search]);

  const handleNewChat = () => {
    setActiveChatId?.(undefined);
    router.push("/chat/new");
    setOpen(false);
    setSearch("");
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId?.(chatId);
    router.push(`/chat/${chatId}`);
    setOpen(false);
    setSearch("");
  };

  return (
    <CommandKContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search chats or type to create new chat..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No chats found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={handleNewChat}>
              <Plus className="h-4 w-4" />
              <span>New Chat</span>
            </CommandItem>
          </CommandGroup>
          {filteredChats.length > 0 && (
            <CommandGroup heading="Chats">
              {filteredChats.map((chat) => (
                <CommandItem
                  key={chat.id}
                  onSelect={() => handleSelectChat(chat.id)}
                >
                  <MessageCircle className="h-4 w-4" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate">{chat.title}</span>
                    {chat.description && (
                      <span className="text-xs text-muted-foreground truncate">
                        {chat.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </CommandKContext.Provider>
  );
}

export function useCommandK() {
  const context = React.useContext(CommandKContext);
  if (!context) {
    throw new Error("useCommandK must be used within CommandKProvider");
  }
  return context;
}

export function CommandK() {
  return null;
}
