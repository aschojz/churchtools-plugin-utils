import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default ({ mode }) => {
    const env = { ...process.env, ...loadEnv(mode, process.cwd()) };
    return defineConfig({
        base: `/ccm/${env.VITE_KEY}/`,
        plugins: [vue(), eslintPlugin(), tailwindcss()],
        resolve: {
            dedupe: ['vue'],
        },
    });
};
