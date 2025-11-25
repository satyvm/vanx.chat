import { Injectable } from '@nestjs/common';
import { LanguageModel } from 'ai';
import { GeminiAdapter } from './gemini.adapter';
import { ProviderAdapter } from './interfaces';

@Injectable()
export class LLMFactory {
  private adapters: Map<string, ProviderAdapter> = new Map();

  constructor() {
    this.registerAdapter('google', new GeminiAdapter());
  }

  registerAdapter(providerName: string, adapter: ProviderAdapter) {
    this.adapters.set(providerName, adapter);
  }

  getProvider(providerName: string): ProviderAdapter {
    const adapter = this.adapters.get(providerName);
    if (!adapter) {
      throw new Error(`Provider ${providerName} not found`);
    }
    return adapter;
  }

  getModel(providerName: string, modelId?: string): LanguageModel {
    return this.getProvider(providerName).getModel(modelId);
  }

  // Auto Mode Foundation
  selectBestModel(prompt: string): { provider: string; model: string } {
    // TODO: Implement complexity analysis
    // For now, default to Gemini Flash for everything
    return { provider: 'google', model: 'gemini-2.5-flash' };
  }
}
