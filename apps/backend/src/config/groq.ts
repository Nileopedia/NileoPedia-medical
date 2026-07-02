import { Groq } from 'groq-sdk';
import { CONFIG } from './env';

let groqInstance: Groq | null = null;

export const initGroq = () => {
  if (groqInstance) {
    return groqInstance;
  }

  if (!CONFIG.GROQ_API_KEY) {
    throw new Error('Groq API key not set');
  }

  groqInstance = new Groq({
    apiKey: CONFIG.GROQ_API_KEY,
  });

  return groqInstance;
};

export const getGroq = () => {
  if (!groqInstance) {
    throw new Error('Groq not initialized. Call initGroq first.');
  }
  return groqInstance;
};
