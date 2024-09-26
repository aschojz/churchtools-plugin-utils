import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default ({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
    return defineConfig({
        base: `/ccm/${process.env.VITE_KEY}/`,
        plugins: [vue(), eslintPlugin()],
        resolve: {
            dedupe: ['vue'],
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@import "${path.resolve(
                        __dirname,
                    )}/node_modules/@churchtools/styleguide/src/scss/variables.scss";`,
                },
            },
        },
    });
};
