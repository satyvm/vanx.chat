import type { UIMessage } from "ai";
import { cn } from "@vanx/ui/lib/utils";

type ChatMessage = UIMessage & { content?: string };
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

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="flex w-full max-w-full flex-col p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <p>Start a conversation by typing a message below</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex min-w-0 max-w-[85%] sm:max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm break-words whitespace-pre-wrap",
              message.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted",
            )}
          >
            {getMessageText(message)}
          </div>
        ))
      )}
    </div>
  );
}
