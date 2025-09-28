/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OXILOR_API_KEY: string;
  // thêm biến khác ở đây
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
