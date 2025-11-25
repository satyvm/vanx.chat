import { google } from '@ai-sdk/google';
import { LanguageModel } from 'ai';
import { ProviderAdapter } from './interfaces';

const DEFAULT_MODEL = 'gemini-2.5-flash';

export class GeminiAdapter implements ProviderAdapter {
  getModel(modelId: string = DEFAULT_MODEL): LanguageModel {
    // Default to flash if no model specified or if it's just 'gemini'
    const modelName = modelId === 'gemini' ? DEFAULT_MODEL : modelId;
    return google(modelName);
  }
}
