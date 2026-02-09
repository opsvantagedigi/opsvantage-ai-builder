declare module 'next-auth/next' {
  export * from 'next-auth';
}

declare module 'next-auth/providers/credentials' {
  import { CredentialsConfig } from 'next-auth/providers/credentials';
  const credentials: (options: Partial<CredentialsConfig>) => import('next-auth/providers').Provider;
  export default credentials;
}

declare module 'next-auth/providers/github' {
  import { OAuthConfig, GithubOptions } from 'next-auth/providers/github';
  const github: (options: GithubOptions) => OAuthConfig<any>;
  export default github;
}

declare module 'next-auth/providers/google' {
  import { OAuthConfig, GoogleOptions } from 'next-auth/providers/google';
  const google: (options: GoogleOptions) => OAuthConfig<any>;
  export default google;
}

declare module 'next-auth/react' {
  export * from 'next-auth/react';
}