import type { LanguageModelV2 } from '@ai-sdk/provider';

export interface ProviderAdapter {
  getModel(modelId?: string): LanguageModelV2;
}
