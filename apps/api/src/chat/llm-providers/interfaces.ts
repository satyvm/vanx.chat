import { LanguageModel } from 'ai';

export interface ProviderAdapter {
  getModel(modelId?: string): LanguageModel;
}
