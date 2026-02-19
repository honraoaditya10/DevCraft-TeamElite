/**
 * LangChain Configuration
 * Initializes and configures LangChain for Docu-Agent
 */

import dotenv from 'dotenv';

dotenv.config();

export const langchainConfig = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-3.5-turbo',
    temperature: 0.2,
    maxTokens: 2000
  },

  // Anthropic Configuration
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: 'claude-2',
    temperature: 0.2
  },

  // Vector Store Configuration
  vectorStore: {
    type: 'faiss',
    embeddingModel: 'text-embedding-ada-002',
    dimension: 1536,
    indexPath: './ai/vector_store'
  },

  // PDF Processing
  pdfProcessing: {
    chunkSize: 1000,
    chunkOverlap: 200,
    enableOCR: true,
    ocrLanguage: ['en', 'hi', 'mr']
  },

  // Chain Configuration
  chain: {
    type: 'retrieval-qa',
    searchType: 'similarity',
    returnSourceDocuments: true,
    chainType: 'stuff'
  },

  // Enable/Disable LangChain
  enabled: process.env.LANGCHAIN_ENABLED !== 'false',
  debug: process.env.DEBUG === 'true'
};

export const initializeLangChain = () => {
  if (!langchainConfig.enabled) {
    console.log('LangChain is disabled');
    return null;
  }

  console.log('Initializing LangChain integration...');
  console.log('- OpenAI:', langchainConfig.openai.apiKey ? '✓ Configured' : '✗ Missing API key');
  console.log('- Anthropic:', langchainConfig.anthropic.apiKey ? '✓ Configured' : '✗ Missing API key');
  console.log('- Vector Store:', langchainConfig.vectorStore.type);
  
  return langchainConfig;
};

export default langchainConfig;
