import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss(), svelte()],
	build: {
		rollupOptions: {
			output: {
				// By default Vite packs everything into a single JS bundle.
				// Three.js alone is ~470 kB, which pushes the bundle over Vite's
				// 500 kB warning threshold. Declaring it as a manual chunk splits
				// it into a separate file that the browser can cache independently,
				// keeping the app bundle small and avoiding the warning.
				manualChunks: {
					three: ['three']
				}
			}
		}
	}
});
