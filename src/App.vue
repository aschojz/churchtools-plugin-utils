<script setup lang="ts">
import { Grid, InfoMessageContainer, LoadingMessage, SidebarDisclosure } from '@churchtools/styleguide';
import { useToasts, useTranslationsQuery } from '@churchtools/utils';
import { computed } from 'vue';
import { RouterView } from 'vue-router';
import GridHeader from './components/GridHeader.vue';
import useMenu from './composables/useMenu';
import useModuleSettings from './composables/useModuleSettings';
import { txx } from './utils';

const { menu } = useMenu();
const { neededCategoriesCount } = useModuleSettings();
const { isLoading } = useTranslationsQuery();

const { toasts, removeToast } = useToasts();
const removeInfoMessage = (infoMessage: (typeof toasts.value)[0]) => removeToast(infoMessage.id);

const isDev = computed(() => import.meta.env.MODE === 'development');
</script>

<template>
    <!-- is removed in build-mode -->
    <div v-if="isLoading" class="flex grow flex-col">
        <LoadingMessage icon="fas fa-tools" message="Daten werden geladen" />
    </div>
    <Grid
        v-else
        class="w-full"
        min-height="var(--grid-min-height, 57px)"
        style="--color-link: var(--accent-bright); --grid-left: 263px; --grid-left-collapsed: 0px"
    >
        <template #header>
            <GridHeader
                icon="fas fa-tools"
                :menu="[{ name: txx('Einstellungen'), to: { name: 'settings' }, badge: neededCategoriesCount }]"
                :title="txx('Helferlein')"
            />
        </template>
        <template #left="{ toggle, isOverlay }">
            <SidebarDisclosure
                :menu="menu"
                storage-key="ccm.utils.menu"
                :storage-key-generator="id => `groups/sidebar-disclosure/${id}`"
                @close="() => (isOverlay ? toggle() : undefined)"
            />
        </template>
        <RouterView />
    </Grid>
    <div v-if="isDev">
        <InfoMessageContainer :messages="toasts" @close-info-message="removeInfoMessage" />
    </div>
</template>
<style scoped>
.navbar {
    height: 56px;
    background: #0e204b;
}
</style>
