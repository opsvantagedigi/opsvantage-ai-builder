// Re-export root-level copywriting engine so imports using the `@/lib/ai/...` alias work
export * from '../../../copywriting-engine';

// Default export passthrough
export { refineText as default } from '../../../copywriting-engine';
