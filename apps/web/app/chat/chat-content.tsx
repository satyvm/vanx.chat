"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageList } from "@/components/message-list";
import { ChatInput } from "@/components/chat-input";
import { useChatHook } from "@/hooks/use-chat-custom";
import { useChatList } from "@/components/chat-list-provider";
import { useSidebar } from "@vanx/ui/components/sidebar";
import { Skeleton } from "@vanx/ui/components/skeleton";

export function ChatContent({ initialChatId }: { initialChatId?: string }) {
  const router = useRouter();
  const { refreshChats, setActiveChatId } = useChatList();
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  const {
    chatId,
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    model,
    setModel,
    isRestoring,
  } = useChatHook({
    chatId: initialChatId,
    onChatsChanged: refreshChats,
  });
  const hasAssistantMessage = messages.some((m) => m.role === "assistant");
  const canNavigate =
    !!chatId &&
    chatId !== initialChatId &&
    !isLoading &&
    !isRestoring &&
    hasAssistantMessage;

  // Keep global active chat in sync with URL param
  useEffect(() => {
    setActiveChatId(initialChatId);
  }, [initialChatId, setActiveChatId]);

  // When a new chat is created (no initialChatId) or different chat is loaded, update the URL.
  useEffect(() => {
    if (!canNavigate) return;
    setActiveChatId(chatId!);
    router.replace(`/chat/${chatId}`, { scroll: false });
  }, [canNavigate, chatId, initialChatId, router, setActiveChatId]);

  return (
    <>
      <div className="h-full max-w-[700px] mx-auto w-full">
        <div className="h-full overflow-y-auto pb-32">
          {isRestoring && messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p>Loading chat...</p>
            </div>
          ) : (
            <>
              <MessageList messages={messages} />
              {isLoading && (
                <div className="space-y-3 pt-4">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              )}
              {!hasAssistantMessage && isLoading && (
                <div className="space-y-3 pt-4">
                  <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div
        className="fixed bottom-0 z-50 bg-background/80 backdrop-blur-md transition-[left,right] duration-200"
        style={{
          left: isMobile ? "0" : isCollapsed ? "3rem" : "16rem",
          right: "0",
        }}
      >
        <div className="max-w-[700px] mx-auto w-full px-4 py-4">
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading || isRestoring}
            model={model}
            onModelChange={setModel}
          />
        </div>
      </div>
    </>
  );
}
