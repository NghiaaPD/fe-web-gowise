import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		host: '0.0.0.0', // Listen on all network interfaces
		port: 5173,
		allowedHosts: true // Allow all hosts including 192.168.x.x
	}
});
