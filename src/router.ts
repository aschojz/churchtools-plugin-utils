import { defineAsyncComponent } from 'vue';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Overview from './overview/Overview.vue';

const routes: RouteRecordRaw[] = [
    {
        path: '/templates-email',
        name: 'templates-email',
        component: defineAsyncComponent(() => import('./tools/templates-email/TemplatesEmail.vue')),
    },
    {
        path: '/templates-post',
        name: 'templates-post',
        component: defineAsyncComponent(() => import('./tools/templates-post/TemplatesPost.vue')),
    },
    {
        path: '/qr-code',
        name: 'qr-code',
        component: defineAsyncComponent(() => import('./tools/qr-code/QRCode.vue')),
    },
    {
        path: '/settings',
        name: 'settings',
        component: defineAsyncComponent(() => import('./settings/Settings.vue')),
    },
    { path: '/overview', name: 'overview', component: Overview },
    { path: '', redirect: { name: 'overview' } },
];

export const router = createRouter({
    routes,
    history: createWebHistory(`/ccm/${import.meta.env.VITE_KEY}/`),
    scrollBehavior(to, from, savedPosition) {
        if (to.hash) {
            return { el: to.hash, left: 0, top: 70 };
        } else if (savedPosition) {
            return savedPosition;
        } else if (to.name !== from.name) {
            return { left: 0, top: 0 };
        }
        return {};
    },
});
