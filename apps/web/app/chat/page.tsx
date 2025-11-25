"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { MessageList } from "@/components/message-list";
import { ChatInput } from "@/components/chat-input"; // Reusing existing component
import { useChatHook } from "@/hooks/use-chat-custom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@vanx/ui/components/breadcrumb";

export default function ChatPage() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    model,
    setModel,
  } = useChatHook();

  return (
    <DashboardLayout
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Chat</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
    >
      <div className="flex flex-col h-full min-h-0 max-w-full overflow-hidden rounded-xl border bg-background">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <MessageList messages={messages} />
        </div>

        <div className="flex-shrink-0 border-t bg-background p-4">
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            model={model}
            onModelChange={setModel}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
