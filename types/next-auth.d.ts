// Augment next-auth/react types for signIn
declare module 'next-auth/react' {
  export function signIn(
    provider?: string,
    options?: Record<string, any>
  ): Promise<any>;
}
