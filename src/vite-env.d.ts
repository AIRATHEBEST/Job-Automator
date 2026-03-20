/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATABASE_URL: string
  readonly VITE_JWT_SECRET: string
  readonly VITE_ADZUNA_APP_ID: string
  readonly VITE_ADZUNA_API_KEY: string
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
