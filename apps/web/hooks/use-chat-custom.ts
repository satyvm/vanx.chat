"use client";

import { useChat, type UseChatHelpers } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
  type SyntheticEvent,
} from "react";

const DEFAULT_CHAT_API = `${
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
}/chat`;
const DEFAULT_MODEL = "gemini-2.5-flash";

type ChatHelpers = UseChatHelpers<UIMessage>;

interface UseChatHookOptions {
  api?: string;
  defaultModel?: string;
}

export interface UseChatHookReturn {
  input: string;
  model: string;
  messages: UIMessage[];
  isLoading: boolean;
  sendMessage: ChatHelpers["sendMessage"];
  stop: ChatHelpers["stop"];
  setMessages: ChatHelpers["setMessages"];
  setModel: Dispatch<SetStateAction<string>>;
  handleInputChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleSubmit: (event?: SyntheticEvent) => Promise<void> | void;
}

export function useChatHook({
  api = DEFAULT_CHAT_API,
  defaultModel = DEFAULT_MODEL,
}: UseChatHookOptions = {}): UseChatHookReturn {
  const [input, setInput] = useState("");
  const [model, setModel] = useState(defaultModel);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api,
        credentials: "include",
      }),
    [api],
  );

  const { messages, sendMessage, status, stop, setMessages } =
    useChat<UIMessage>({
      transport,
      onError: (error) => {
        console.error("Chat error:", error);
      },
    });

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(event.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event?: SyntheticEvent) => {
      event?.preventDefault();
      const trimmedValue = input.trim();
      if (!trimmedValue) {
        return;
      }

      await sendMessage(
        { text: trimmedValue },
        {
          body: { model },
        },
      );

      setInput("");
    },
    [input, model, sendMessage],
  );

  const isLoading = status === "submitted" || status === "streaming";

  return {
    input,
    model,
    messages,
    isLoading,
    sendMessage,
    stop,
    setMessages,
    setModel,
    handleInputChange,
    handleSubmit,
  };
}
