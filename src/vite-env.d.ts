/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BETTER_AUTH_URL: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
