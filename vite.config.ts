import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // FIX: Replaced `process.cwd()` with `'.'` to resolve a TypeScript error where `cwd` was not
  // found on the `process` object type. This is likely due to conflicting client-side typings
  // for the `process` global. Using `'.'` correctly refers to the current working directory.
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    // vite config
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
});
