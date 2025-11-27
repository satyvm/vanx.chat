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
const MODEL_STORAGE_PREFIX = "chat-model";
const NEW_CHAT_KEY = "new";

type ModelUIMessage = UIMessage & {
  model?: string;
  metadata?: Record<string, unknown> | undefined;
};

type ChatHelpers = UseChatHelpers<ModelUIMessage>;

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
  messages: ModelUIMessage[];
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

type MessageWithModel = ModelUIMessage & {
  metadata?: { model?: string; [key: string]: unknown };
};

function attachModelToLatestAssistant(
  messages: ModelUIMessage[],
  model: string,
): ModelUIMessage[] {
  if (!model || !messages.length) {
    return messages;
  }

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index] as MessageWithModel;
    if (message.role !== "assistant") continue;

    const existingModel =
      message.model ??
      (typeof message.metadata === "object" && message.metadata !== null
        ? message.metadata.model
        : undefined);
    if (existingModel) {
      return messages;
    }

    const updated = [...messages];
    updated[index] = {
      ...message,
      model,
      metadata: { ...(message.metadata ?? {}), model },
    } as ModelUIMessage;
    return updated;
  }

  return messages;
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
  const readStoredModel = useCallback((chatKey: string) => {
    if (typeof window === "undefined") return undefined;
    try {
      return (
        localStorage.getItem(`${MODEL_STORAGE_PREFIX}:${chatKey}`) ?? undefined
      );
    } catch (error) {
      console.warn("Unable to read model from storage", error);
      return undefined;
    }
  }, []);

  const persistModel = useCallback((chatKey: string, value: string) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`${MODEL_STORAGE_PREFIX}:${chatKey}`, value);
    } catch (error) {
      console.warn("Unable to persist model selection", error);
    }
  }, []);

  const normalizeModelId = useCallback(
    (modelId?: string) => {
      if (!modelId) return defaultModel;
      if (modelId === "gemini") return "gemini-2.5-flash";
      if (modelId === "openai") return "gpt-4o";
      if (modelId === "groq") return "llama-3.3-70b-versatile";
      if (modelId === "xai" || modelId === "grok") return "grok-4-1";
      return modelId;
    },
    [defaultModel],
  );

  const extractAssistantModel = useCallback(
    (messages: ModelUIMessage[]) => {
      const lastAssistant = [...messages]
        .reverse()
        .find((message) => message.role === "assistant");
      if (!lastAssistant) {
        return undefined;
      }
      const metadataModel =
        typeof lastAssistant.metadata === "object" &&
        lastAssistant.metadata !== null
          ? (lastAssistant.metadata as { model?: string }).model
          : undefined;
      const inlineModel = (lastAssistant as { model?: string }).model;
      return normalizeModelId(inlineModel ?? metadataModel);
    },
    [normalizeModelId],
  );

  const [model, setModel] = useState(() => {
    return readStoredModel(initialChatId ?? NEW_CHAT_KEY) ?? defaultModel;
  });
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
    useChat<ModelUIMessage>({
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
          ? (chat.messages as ModelUIMessage[])
          : [];
        const restoredModel =
          readStoredModel(targetChatId) ??
          extractAssistantModel(parsedMessages) ??
          defaultModel;
        const hydratedMessages = attachModelToLatestAssistant(
          parsedMessages,
          restoredModel,
        );
        setMessages(hydratedMessages);
        setChatId(chat.id);
        setModel(restoredModel);
        persistModel(targetChatId, restoredModel);
        setInput("");
      } catch (error) {
        console.error("Failed to load chat", error);
        setMessages([]);
        setChatId(undefined);
        setModel(defaultModel);
        await onChatsChanged?.();
        router.replace("/chat/new");
      } finally {
        setIsRestoring(false);
      }
    },
    [
      defaultModel,
      extractAssistantModel,
      onChatsChanged,
      persistModel,
      readStoredModel,
      router,
      setInput,
      setMessages,
    ],
  );

  useEffect(() => {
    if (initialChatId) {
      setChatId(initialChatId);
      void loadChat(initialChatId);
    } else {
      setChatId(undefined);
      setMessages([]);
      const stored = readStoredModel(NEW_CHAT_KEY) ?? defaultModel;
      setModel(stored);
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
      const selectedModel = normalizeModelId(model);

      // Clear input immediately for better UX
      setInput("");

      let resolvedChatId = chatId;
      if (!resolvedChatId) {
        const draftMessages: ModelUIMessage[] = [
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
          body: { model: selectedModel, chatId: resolvedChatId },
        },
      );
      setMessages((current) =>
        attachModelToLatestAssistant(current, selectedModel),
      );
      const modelStorageKey = resolvedChatId ?? NEW_CHAT_KEY;
      persistModel(modelStorageKey, selectedModel);
      if (!resolvedChatId) {
        // Only update the "new chat" default when we were on a new chat
        persistModel(NEW_CHAT_KEY, selectedModel);
      }

      await onChatsChanged?.();
    },
    [
      chatId,
      input,
      messages,
      normalizeModelId,
      model,
      onChatsChanged,
      persistModel,
      sendMessage,
      setMessages,
    ],
  );

  const activeChatKey = chatId ?? initialChatId ?? NEW_CHAT_KEY;
  const isNewChat = activeChatKey === NEW_CHAT_KEY;

  useEffect(() => {
    const normalizedModel = normalizeModelId(model);
    persistModel(activeChatKey, normalizedModel);
    if (isNewChat) {
      persistModel(NEW_CHAT_KEY, normalizedModel);
    }
  }, [activeChatKey, isNewChat, model, normalizeModelId, persistModel]);

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
