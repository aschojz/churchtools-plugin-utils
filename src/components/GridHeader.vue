<script setup lang="ts">
import { Button, Tag } from '@churchtools/styleguide';
import { FAIcon } from '@churchtools/utils';
import { RouteLocationRaw } from 'vue-router';

defineProps<{
    isBeta?: boolean;
    title: string;
    icon: FAIcon;
    menu?: { name: string; to: RouteLocationRaw; badge?: number }[];
    actions?: InstanceType<typeof Button>['$props'][][];
    onToggle?: () => void;
}>();
defineEmits<{
    (event: 'toggle'): void;
}>();
</script>
<template>
    <div
        class="flex w-full max-w-full items-center justify-between border-0 border-b border-solid border-basic-divider bg-foreground-primary px-4 py-1 text-body-m-emphasized lg:px-6 lg:py-2 lg:text-body-l-emphasized"
    >
        <div class="flex flex-shrink-0 items-center gap-2 md:gap-4">
            <Button
                v-if="onToggle"
                class="-ml-3 -mr-1 xl:hidden"
                color="gray"
                icon="fas fa-bars"
                text
                @click="$emit('toggle')"
            ></Button>
            <router-link
                class="-mx-3 flex h-10 items-center gap-4 rounded px-3 hover:bg-background-secondary hover:no-underline"
                style="--color-link: var(--basic-primary)"
                to="/"
            >
                <i class="w-6 text-center text-body-m-emphasized text-basic-tertiary" :class="icon"></i>
                <span>{{ title }}</span>
            </router-link>
            <Tag v-if="isBeta" class="text-body-m font-normal" color="violet" label="Beta" size="M" />
            <div v-if="menu?.length" class="h-6 w-px flex-shrink-0 bg-basic-divider"></div>
        </div>
        <div class="flex flex-grow items-center gap-4 overflow-x-auto pl-4">
            <template v-if="menu?.length">
                <router-link
                    v-for="(item, index) in menu"
                    :key="index"
                    class="-mx-3 flex h-10 items-center rounded px-3 text-basic-secondary hover:bg-background-secondary hover:no-underline"
                    style="--color-link: var(--basic-secondary)"
                    :to="item.to"
                >
                    {{ item.name }}
                    <div
                        v-if="item.badge"
                        class="-mt-4 h-4 w-4 rounded-full bg-red-500 text-center text-body-xs-emphasized text-white"
                    >
                        {{ item.badge }}
                    </div>
                </router-link>
            </template>
        </div>
        <div class="flex items-center gap-2 pl-2 md:gap-4">
            <slot name="right">
                <template v-for="(section, sectionIndex) in actions" :key="sectionIndex">
                    <div v-if="sectionIndex > 0" class="hidden h-6 w-px bg-basic-divider lg:flex"></div>
                    <Button
                        v-for="(action, actionIndex) in section"
                        :key="`${sectionIndex}-${actionIndex}`"
                        v-bind="action"
                    />
                </template>
            </slot>
        </div>
    </div>
</template>
