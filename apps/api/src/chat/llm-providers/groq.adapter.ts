import { groq } from '@ai-sdk/groq';
import type { LanguageModelV2 } from '@ai-sdk/provider';
import { ProviderAdapter } from './interfaces';

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export class GroqAdapter implements ProviderAdapter {
  getModel(modelId: string = DEFAULT_MODEL): LanguageModelV2 {
    const modelName = modelId === 'groq' ? DEFAULT_MODEL : modelId;
    return groq(modelName);
  }
}
