import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		host: '0.0.0.0', // Listen on all network interfaces
		port: 5173,
		allowedHosts: true, // Allow all hosts including 192.168.x.x
		proxy: {
			'/api': {
				target: 'http://gowise.ddns.net:8081',
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path,
				configure: (proxy, _options) => {
					proxy.on('error', (err, _req, _res) => {
						console.log('❌ [Proxy Error]', err);
					});
					proxy.on('proxyReq', (proxyReq, req, _res) => {
						console.log('➡️ [Proxy Request]', req.method, req.url);
						// Log headers để debug
						console.log('   Headers:', req.headers);
					});
					proxy.on('proxyRes', (proxyRes, req, _res) => {
						console.log('⬅️ [Proxy Response]', proxyRes.statusCode, req.url);
					});
				},
			}
		}
	}
});
