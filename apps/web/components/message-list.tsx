"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { cn } from "@vanx/ui/lib/utils";
import { MarkdownMessage } from "./markdown-message";

type ChatMessage = UIMessage & {
  content?: string;
  model?: string;
  metadata?: unknown;
};
type MessagePart = ChatMessage["parts"][number];
type TextPart = Extract<MessagePart, { type: "text" }>;

const isTextPart = (part: MessagePart): part is TextPart =>
  part.type === "text";

const getMessageText = (message: ChatMessage) => {
  if (typeof message.content === "string") {
    return message.content;
  }
  return message.parts
    .filter(isTextPart)
    .map((part) => part.text)
    .join("\n");
};

const getMessageModel = (message: ChatMessage) =>
  message.model ??
  (typeof message.metadata === "object" &&
  message.metadata !== null &&
  "model" in message.metadata
    ? (message.metadata as { model?: string }).model
    : undefined);

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  if (messages.length === 0) {
    return null;
  }
  return (
    <div className="flex w-full max-w-full flex-col p-4 space-y-4">
      {messages.map((message) => {
        const text = getMessageText(message);
        const isUser = message.role === "user";
        const model = getMessageModel(message);
        return (
          <div
            key={message.id}
            className={cn(
              "flex min-w-0 max-w-[85%] sm:max-w-[75%] flex-col gap-2 px-3 py-2 text-sm",
              isUser
                ? "ml-auto bg-primary text-primary-foreground rounded-lg"
                : "bg-muted/50 rounded-lg",
            )}
          >
            {isUser ? (
              <div className="break-words whitespace-pre-wrap">{text}</div>
            ) : (
              <MarkdownMessage
                content={text}
                className={cn("text-foreground", isUser && "prose-invert")}
              />
            )}
            {!isUser && model && (
              <div className="text-[11px] text-muted-foreground">
                Model: {model}
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
