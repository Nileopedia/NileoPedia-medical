import { Pinecone } from '@pinecone-database/pinecone';
import { CONFIG } from './env';

let pineconeInstance: Pinecone | null = null;

export const initPinecone = () => {
  if (pineconeInstance) {
    return pineconeInstance;
  }

  if (!CONFIG.PINECONE_API_KEY) {
    throw new Error('Pinecone API key not set');
  }

  pineconeInstance = new Pinecone({
    apiKey: CONFIG.PINECONE_API_KEY,
  });

  return pineconeInstance;
};

export const getPineconeIndex = () => {
  if (!pineconeInstance) {
    throw new Error('Pinecone not initialized. Call initPinecone first.');
  }

  return pineconeInstance.Index(CONFIG.PINECONE_INDEX_NAME);
};
