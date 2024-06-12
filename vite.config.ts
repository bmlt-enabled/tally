import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		noExternal: ['@googlemaps/js-api-loader', '@googlemaps/adv-markers-utils']
	}
});
