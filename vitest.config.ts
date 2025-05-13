import { defineConfig } from 'vitest/config';
import { mergeConfig } from 'vite';
import viteConfig from './vite.config';
import path from 'path';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: 'tests/setup.ts',
      include: ['tests/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      exclude: ['**/node_modules/**', '**/dist/**'],
      root: './',
      coverage: {
        reporter: ['text', 'json', 'html'],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'client/src'),
        '@shared': path.resolve(__dirname, 'shared'),
        '@assets': path.resolve(__dirname, 'attached_assets'),
        '@test': path.resolve(__dirname, 'tests'),
      },
    }
  })
);