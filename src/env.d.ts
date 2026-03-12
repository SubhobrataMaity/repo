/* eslint-disable @typescript-eslint/no-unused-vars */

declare global {
  // Minimal typing for using `process.env.*` inside the Vite client bundle
  // (values are injected via `vite.config.ts` define()).
  // eslint-disable-next-line no-var
  var process: {
    env: Record<string, string | undefined>;
  };
}

// Vite exposes VITE_* env vars via import.meta.env at build time.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
