import OpenAI from 'openai';
import { CONFIG } from './env';

let openaiInstance: OpenAI | null = null;

export const initOpenAI = () => {
  if (openaiInstance) {
    return openaiInstance;
  }

  if (!CONFIG.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not set');
  }

  openaiInstance = new OpenAI({
    apiKey: CONFIG.OPENAI_API_KEY,
  });

  return openaiInstance;
};

export const getOpenAI = () => {
  if (!openaiInstance) {
    throw new Error('OpenAI not initialized. Call initOpenAI first.');
  }
  return openaiInstance;
};