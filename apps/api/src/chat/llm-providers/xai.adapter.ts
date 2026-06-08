import { createXai } from '@ai-sdk/xai';
import type { LanguageModelV2 } from '@ai-sdk/provider';
import { ProviderAdapter } from './interfaces';

const DEFAULT_MODEL = 'grok-4-1';

// Only expose xAI chat models that are v2-compatible per ai-sdk docs.
const SUPPORTED_CHAT_MODELS = new Set<string>([
  'grok-4-1',
  'grok-4-1-fast-reasoning',
  'grok-4-1-fast-non-reasoning',
  'grok-4',
  'grok-4-fast-reasoning',
  'grok-4-fast-non-reasoning',
  'grok-code-fast-1',
  'grok-3',
  'grok-3-fast',
  'grok-3-mini',
  'grok-3-mini-fast',
]);

const xaiProvider = createXai({
  apiKey: process.env.XAI_API_KEY,
  baseURL: process.env.XAI_BASE_URL,
});

export class XAIAdapter implements ProviderAdapter {
  getModel(modelId: string = DEFAULT_MODEL): LanguageModelV2 {
    const normalized =
      modelId === 'xai' ||
      modelId === 'grok' ||
      !SUPPORTED_CHAT_MODELS.has(modelId)
        ? DEFAULT_MODEL
        : modelId;

    return xaiProvider.languageModel(normalized);
  }
}
