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
        class="border-basic-divider bg-foreground-primary text-body-m-emphasized lg:text-body-l-emphasized flex w-full max-w-full items-center justify-between border-0 border-b border-solid px-4 py-1 lg:px-6 lg:py-2"
    >
        <div class="flex flex-shrink-0 items-center gap-2 md:gap-4">
            <Button
                v-if="onToggle"
                class="-mr-1 -ml-3 xl:hidden"
                color="gray"
                icon="fas fa-bars"
                text
                @click="$emit('toggle')"
            ></Button>
            <router-link
                class="hover:bg-background-secondary -mx-3 flex h-10 items-center gap-4 rounded px-3 hover:no-underline"
                style="--color-link: var(--basic-primary)"
                to="/"
            >
                <i class="text-body-m-emphasized text-basic-tertiary w-6 text-center" :class="icon"></i>
                <span>{{ title }}</span>
            </router-link>
            <Tag v-if="isBeta" class="text-body-m font-normal" color="violet" label="Beta" size="M" />
            <div v-if="menu?.length" class="bg-basic-divider h-6 w-px flex-shrink-0"></div>
        </div>
        <div class="flex flex-grow items-center gap-4 overflow-x-auto pl-4">
            <template v-if="menu?.length">
                <router-link
                    v-for="(item, index) in menu"
                    :key="index"
                    class="text-basic-secondary hover:bg-background-secondary -mx-3 flex h-10 items-center rounded px-3 hover:no-underline"
                    style="--color-link: var(--basic-secondary)"
                    :to="item.to"
                >
                    {{ item.name }}
                    <div
                        v-if="item.badge"
                        class="text-body-xs-emphasized -mt-4 h-4 w-4 rounded-full bg-red-500 text-center text-white"
                    >
                        {{ item.badge }}
                    </div>
                </router-link>
            </template>
        </div>
        <div class="flex items-center gap-2 pl-2 md:gap-4">
            <slot name="right">
                <template v-for="(section, sectionIndex) in actions" :key="sectionIndex">
                    <div v-if="sectionIndex > 0" class="bg-basic-divider hidden h-6 w-px lg:flex"></div>
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
