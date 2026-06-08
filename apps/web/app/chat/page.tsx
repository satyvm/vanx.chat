"use client";

import { useRouter } from "next/navigation";
import { Loader2, Plus, SearchIcon } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useChatList } from "@/components/chat-list-provider";
import { Button } from "@vanx/ui/components/button";
import { Input } from "@vanx/ui/components/input";

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  } else {
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) {
      return `${diffWeeks} ${diffWeeks === 1 ? "week" : "weeks"} ago`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
    }
  }
}

function ChatListContent() {
  const router = useRouter();
  const { chats, isLoading, error } = useChatList();

  return (
    <div className="flex flex-col h-full min-h-0 w-full">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-[700px] mx-auto w-full py-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold">Chats</h1>
            <Button
              onClick={() => router.push("/chat/new")}
              className="gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              New chat
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search your chats..." className="pl-9" />
            </div>
          </div>

          {chats.length > 0 && (
            <div className="mb-4 text-sm text-muted-foreground">
              <span>{chats.length} chats</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm">Loading chats...</span>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center text-destructive">
              <p className="text-sm">Unable to load chats: {error}</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col h-64 items-center justify-center text-muted-foreground gap-4">
              <p className="text-sm">No chats yet</p>
              <Button onClick={() => router.push("/chat/new")} size="sm">
                Start a new chat
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => router.push(`/chat/${chat.id}`)}
                  className="w-full text-left py-3 px-3 transition-colors hover:bg-accent/50 rounded-md"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-sm">
                      {chat.title || "Untitled"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last message {formatRelativeTime(chat.updatedAt)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <DashboardLayout>
      <ChatListContent />
    </DashboardLayout>
  );
}
