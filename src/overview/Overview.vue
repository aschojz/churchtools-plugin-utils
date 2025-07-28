<script setup lang="ts">
import { ContentWrapper, SectionHeader } from '@churchtools/styleguide';
import { computed } from 'vue';
import LinkCard from '../components/LinkCard.vue';
import useMenu from '../composables/useMenu';
import { txx } from '../utils';

const { menu } = useMenu();
const sections = computed(() => {
    const sections = [...menu.value];
    sections.shift();
    return sections;
});
</script>

<template>
    <ContentWrapper color="accent" icon="fas fa-grid-2" max-width :title="txx('Kleine Helferlein')">
        <div v-for="section in sections" :key="section.key" class="flex flex-col gap-4">
            <SectionHeader :label="section.title" />
            <div class="grid gap-2 md:grid-cols-2">
                <LinkCard
                    v-for="tool in section.children"
                    :key="tool.key"
                    :description="tool.description"
                    :icon="tool.avatar?.icon"
                    :title="tool.title"
                    :to="tool.to"
                ></LinkCard>
            </div>
        </div>
    </ContentWrapper>
</template>
