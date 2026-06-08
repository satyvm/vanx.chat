import { Injectable } from '@nestjs/common';
import type { LanguageModelV2 } from '@ai-sdk/provider';
import { GeminiAdapter } from './gemini.adapter';
import { OpenAIAdapter } from './openai.adapter';
import { GroqAdapter } from './groq.adapter';
import { XAIAdapter } from './xai.adapter';
import { ProviderAdapter } from './interfaces';

@Injectable()
export class LLMFactory {
  private adapters: Map<string, ProviderAdapter> = new Map();

  constructor() {
    this.registerAdapter('google', new GeminiAdapter());
    this.registerAdapter('openai', new OpenAIAdapter());
    this.registerAdapter('groq', new GroqAdapter());
    this.registerAdapter('xai', new XAIAdapter());
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

  detectProvider(modelId?: string): string {
    if (!modelId) {
      return 'google';
    }
    const lowerModelId = modelId.toLowerCase();
    // OpenAI models: gpt-*, o1-*, o3-*
    // Note: openai/gpt-oss-* are Groq models, not OpenAI
    if (
      (lowerModelId.startsWith('gpt-') &&
        !lowerModelId.startsWith('openai/gpt-')) ||
      lowerModelId.startsWith('o1-') ||
      lowerModelId.startsWith('o3-')
    ) {
      return 'openai';
    }
    // xAI (Grok) models: grok-*
    if (lowerModelId.startsWith('grok-') || lowerModelId === 'grok-beta') {
      return 'xai';
    }
    // Groq models: llama-*, mixtral-*, gemma*, qwen*, deepseek*, openai/gpt-oss-*, meta-llama/*, moonshotai/*
    if (
      lowerModelId.startsWith('llama-') ||
      lowerModelId.startsWith('meta-llama/') ||
      lowerModelId.startsWith('mixtral-') ||
      lowerModelId.startsWith('gemma') ||
      lowerModelId.startsWith('qwen') ||
      lowerModelId.startsWith('deepseek') ||
      lowerModelId.startsWith('openai/gpt-oss-') ||
      lowerModelId.startsWith('moonshotai/')
    ) {
      return 'groq';
    }
    // Google models: gemini-*
    if (lowerModelId.startsWith('gemini-')) {
      return 'google';
    }
    return 'google';
  }

  getModel(providerName?: string, modelId?: string): LanguageModelV2 {
    try {
      const provider = providerName || this.detectProvider(modelId);
      return this.getProvider(provider).getModel(modelId);
    } catch (error) {
      throw new Error(
        `Failed to get model ${modelId} from provider ${providerName || 'auto'}: ${(error as Error)?.message ?? 'unknown error'}`,
      );
    }
  }

  selectBestModel(prompt: string): { provider: string; model: string } {
    return { provider: 'google', model: 'gemini-2.5-flash' };
  }
}
