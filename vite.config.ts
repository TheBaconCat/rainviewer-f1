import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { dependencies } from './package.json';

const reactDeps = Object.keys(dependencies).filter((key) => key === 'react' || key.startsWith('react-'));

const manualChunks: Record<string, string[]> = {
  vendor: reactDeps,
  ...Object.keys(dependencies).reduce(
    (chunks, name) => {
      if (!reactDeps.includes(name)) {
        chunks[name] = [name];
      }
      return chunks;
    },
    {} as Record<string, string[]>
  ),
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: manualChunks,
      },
    },
  },
});
