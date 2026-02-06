declare module 'sonner' {
  export const toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    // minimal shape — extend if needed
  };
  export default toast;
}
