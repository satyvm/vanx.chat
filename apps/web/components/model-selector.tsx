"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@vanx/ui/components/select";

type ModelGroup = {
  label: string;
  models: Array<{ value: string; label: string }>;
};

// Curated v2-compatible models drawn from ai-sdk.md provider tables.
const MODEL_GROUPS: ModelGroup[] = [
  {
    label: "OpenAI",
    models: [
      { value: "gpt-4.1", label: "GPT-4.1" },
      { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
      { value: "gpt-4o", label: "GPT-4o" },
      { value: "gpt-4o-mini", label: "GPT-4o Mini" },
      { value: "o1", label: "O1" },
      { value: "o1-mini", label: "O1 Mini" },
      { value: "o3-mini", label: "O3 Mini" },
    ],
  },
  {
    label: "xAI (Grok)",
    models: [
      { value: "grok-4-1", label: "Grok 4.1" },
      { value: "grok-4-1-fast-reasoning", label: "Grok 4.1 Fast Reasoning" },
      {
        value: "grok-4-1-fast-non-reasoning",
        label: "Grok 4.1 Fast Non-Reasoning",
      },
      { value: "grok-4", label: "Grok 4" },
      { value: "grok-4-fast-reasoning", label: "Grok 4 Fast Reasoning" },
      {
        value: "grok-4-fast-non-reasoning",
        label: "Grok 4 Fast Non-Reasoning",
      },
      { value: "grok-code-fast-1", label: "Grok Code Fast 1" },
      { value: "grok-3", label: "Grok 3" },
      { value: "grok-3-fast", label: "Grok 3 Fast" },
      { value: "grok-3-mini", label: "Grok 3 Mini" },
      { value: "grok-3-mini-fast", label: "Grok 3 Mini Fast" },
    ],
  },
  {
    label: "Groq",
    models: [
      { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
      { value: "llama-3.3-8b-instant", label: "Llama 3.3 8B" },
      { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
      { value: "gemma2-9b-it", label: "Gemma2 9B" },
      {
        value: "deepseek-r1-distill-llama-70b",
        label: "DeepSeek R1 Distill Llama 70B",
      },
      {
        value: "deepseek-r1-distill-qwen-32b",
        label: "DeepSeek R1 Distill Qwen 32B",
      },
      { value: "qwen-2.5-32b", label: "Qwen 2.5 32B" },
      { value: "moonshotai/kimi-k2-instruct", label: "Kimi K2 Instruct" },
      { value: "openai/gpt-oss-20b", label: "OpenAI GPT-OSS 20B" },
      { value: "openai/gpt-oss-120b", label: "OpenAI GPT-OSS 120B" },
    ],
  },
  {
    label: "Google",
    models: [
      { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
      { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
      { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
      { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
      { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
    ],
  },
];

export function ModelSelector({
  value,
  onValueChange,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select Model" />
      </SelectTrigger>
      <SelectContent>
        {MODEL_GROUPS.map((group) => (
          <SelectGroup key={group.label}>
            <SelectLabel>{group.label}</SelectLabel>
            {group.models.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
