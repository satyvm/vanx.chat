"use client";

import { useChat, type UseChatHelpers } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
  type SyntheticEvent,
} from "react";
import { useRouter } from "next/navigation";
import { createChat, fetchChat } from "@/lib/api/chat";

const DEFAULT_CHAT_API = `${
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
}/chat`;
const DEFAULT_MODEL = "gemini-2.5-flash";

type ChatHelpers = UseChatHelpers<UIMessage>;

interface UseChatHookOptions {
  api?: string;
  defaultModel?: string;
  chatId?: string;
  onChatsChanged?: () => void | Promise<void>;
}

export interface UseChatHookReturn {
  input: string;
  chatId?: string;
  model: string;
  messages: UIMessage[];
  isLoading: boolean;
  isRestoring: boolean;
  sendMessage: ChatHelpers["sendMessage"];
  stop: ChatHelpers["stop"];
  setMessages: ChatHelpers["setMessages"];
  setModel: Dispatch<SetStateAction<string>>;
  loadChat: (chatId: string) => Promise<void>;
  handleInputChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleSubmit: (event?: SyntheticEvent) => Promise<void> | void;
}

export function useChatHook({
  api = DEFAULT_CHAT_API,
  defaultModel = DEFAULT_MODEL,
  chatId: initialChatId,
  onChatsChanged,
}: UseChatHookOptions = {}): UseChatHookReturn {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | undefined>(initialChatId);
  const [model, setModel] = useState(defaultModel);
  const [isRestoring, setIsRestoring] = useState(false);

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

  const loadChat = useCallback(
    async (targetChatId: string) => {
      setIsRestoring(true);
      try {
        const chat = await fetchChat(targetChatId);
        const parsedMessages = Array.isArray(chat.messages)
          ? (chat.messages as UIMessage[])
          : [];
        setMessages(parsedMessages);
        setChatId(chat.id);
        setInput("");
      } catch (error) {
        console.error("Failed to load chat", error);
        setMessages([]);
        setChatId(undefined);
        await onChatsChanged?.();
        router.replace("/chat/new");
      } finally {
        setIsRestoring(false);
      }
    },
    [onChatsChanged, router, setInput, setMessages],
  );

  useEffect(() => {
    if (initialChatId) {
      setChatId(initialChatId);
      void loadChat(initialChatId);
    } else {
      setChatId(undefined);
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialChatId]);

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

      // Clear input immediately for better UX
      setInput("");

      let resolvedChatId = chatId;
      if (!resolvedChatId) {
        const draftMessages: UIMessage[] = [
          ...messages,
          {
            id: `user-${Date.now()}`,
            role: "user",
            parts: [
              {
                type: "text",
                text: trimmedValue,
              },
            ],
          },
        ];

        const draft = await createChat({
          title: trimmedValue,
          messages: draftMessages,
        });
        resolvedChatId = draft.id;
        setChatId(resolvedChatId);
        await onChatsChanged?.();
      }

      // sendMessage handles streaming automatically
      await sendMessage(
        { text: trimmedValue },
        {
          body: { model, chatId: resolvedChatId },
        },
      );

      await onChatsChanged?.();
    },
    [chatId, input, messages, model, onChatsChanged, sendMessage],
  );

  const isLoading = status === "submitted" || status === "streaming";

  return {
    input,
    chatId,
    model,
    messages,
    isLoading,
    isRestoring,
    sendMessage,
    stop,
    setMessages,
    setModel,
    loadChat,
    handleInputChange,
    handleSubmit,
  };
}
