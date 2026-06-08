"use client";

import { ModelSelector } from "@/components/model-selector";
import {
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  type SyntheticEvent,
} from "react";
import { ArrowUpIcon, Loader2, Plus } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@vanx/ui/components/input-group";
import { Separator } from "@vanx/ui/components/separator";

type SubmitHandler = (event?: SyntheticEvent) => Promise<void> | void;

interface ChatInputProps {
  input?: string;
  handleInputChange?: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleSubmit?: SubmitHandler;
  isLoading?: boolean;
  model?: string;
  onModelChange?: (value: string) => void;
}

const DEFAULT_MODEL = "gemini-2.5-flash";

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  model,
  onModelChange,
}: ChatInputProps) {
  const [fallbackModel, setFallbackModel] = useState(DEFAULT_MODEL);
  const [localInput, setLocalInput] = useState(input ?? "");
  const selectedModel = model ?? fallbackModel;
  const isControlled =
    typeof input !== "undefined" && typeof handleInputChange === "function";
  const inputValue = isControlled ? input : localInput;

  const handleModelChange = (value: string) => {
    if (onModelChange) {
      onModelChange(value);
    } else {
      setFallbackModel(value);
    }
  };

  const handleTextareaChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (handleInputChange) {
      handleInputChange(event);
    } else {
      setLocalInput(event.target.value);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit?.(event);
    }
  };

  return (
    <div className="w-full max-w-full">
      <div className="w-full max-w-full min-w-0">
        <InputGroup className="w-full max-w-full min-w-0 rounded-xl">
          <InputGroupTextarea
            placeholder="Ask, Learn or Chat..."
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            className="min-w-0"
          />
          <InputGroupAddon align="block-end">
            <InputGroupButton
              variant="outline"
              className="rounded-full"
              size="icon-xs"
            >
              <Plus />
            </InputGroupButton>
            <div className="flex items-center">
              <ModelSelector
                value={selectedModel}
                onValueChange={handleModelChange}
                className="h-auto border-0 bg-transparent shadow-none focus:ring-0 w-auto min-w-[120px]"
              />
            </div>
            <InputGroupText className="ml-auto">
              {inputValue.length} chars
            </InputGroupText>
            <Separator orientation="vertical" className="!h-4" />
            <InputGroupButton
              variant="default"
              className="rounded-full"
              size="icon-xs"
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                void handleSubmit?.(event);
              }}
              disabled={isLoading || !inputValue}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpIcon />
              )}
              <span className="sr-only">Send</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}
