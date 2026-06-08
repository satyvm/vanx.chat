import { openai } from '@ai-sdk/openai';
import type { LanguageModelV2 } from '@ai-sdk/provider';
import { ProviderAdapter } from './interfaces';

const DEFAULT_MODEL = 'gpt-4o';

export class OpenAIAdapter implements ProviderAdapter {
  getModel(modelId: string = DEFAULT_MODEL): LanguageModelV2 {
    const modelName = modelId === 'openai' ? DEFAULT_MODEL : modelId;
    return openai(modelName);
  }
}
