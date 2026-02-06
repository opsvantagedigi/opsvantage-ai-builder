// Re-export the local mock generative model implementation so root-level
// modules can import `./gemini`.
export { getGenerativeModel } from './src/lib/ai/gemini';

// Also provide a default export for older imports
export { getGenerativeModel as default } from './src/lib/ai/gemini';
