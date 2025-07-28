import { createApp } from 'vue';

import { churchtoolsClient } from '@churchtools/churchtools-client';
import { ctStyleguide } from '@churchtools/styleguide';
import '@churchtools/styleguide/style';
import { ctUtils } from '@churchtools/utils';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import App from './App.vue';
import './assets/fontawesome/css/all.css';
import { router } from './router';
import './style.css';
import './tailwind.css';

declare const window: Window &
    typeof globalThis & {
        settings: {
            base_url?: string;
        };
    };

const baseUrl = window.settings?.base_url ?? import.meta.env.VITE_BASE_URL;
churchtoolsClient.setBaseUrl(baseUrl);

const app = createApp(App);
const pinia = createPinia();
window.ctPinia = pinia;
// window.i18n = t;
// window.t = t;

app.use(ctUtils, { baseUrl, pinia, t: key => key });
app.use(ctStyleguide, { baseUrl, t: key => key });

app.mixin({
    methods: {
        tx: function (key: string) {
            return key;
        },
        escapeHtmlRelaxed(string: string) {
            return string;
        },
        escapeHtml(string: string) {
            return string;
        },
    },
});

app.use(pinia);
app.use(VueQueryPlugin);
app.use(router);
app.mount('#app');

const username = import.meta.env.VITE_USERNAME;
const password = import.meta.env.VITE_PASSWORD;
if (import.meta.env.MODE === 'development' && username && password) {
    await churchtoolsClient.post('/login', { username, password: 'J~rW[{8H}16I~QD$Vz' });
}

const KEY = import.meta.env.VITE_KEY;
export { KEY };
