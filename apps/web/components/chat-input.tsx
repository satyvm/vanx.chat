"use client";

import { ModelSelector } from "@/components/model-selector";
import {
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  type SyntheticEvent,
} from "react";
import { ArrowUpIcon, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@vanx/ui/components/dropdown-menu";
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
      <div className="flex justify-end mb-4">
        <ModelSelector
          value={selectedModel}
          onValueChange={handleModelChange}
        />
      </div>
      <div className="w-full max-w-full min-w-0">
        <InputGroup className="w-full max-w-full min-w-0">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <InputGroupButton variant="ghost">Auto</InputGroupButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="[--radius:0.95rem]"
              >
                <DropdownMenuItem>Auto</DropdownMenuItem>
                <DropdownMenuItem>Agent</DropdownMenuItem>
                <DropdownMenuItem>Manual</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              <ArrowUpIcon />
              <span className="sr-only">Send</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}
