/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITES_FRONTEND_ONLY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
