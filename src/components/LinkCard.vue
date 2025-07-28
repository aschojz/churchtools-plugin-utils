<script setup lang="ts">
import { Avatar, Card } from '@churchtools/styleguide';
import { FAIcon } from '@churchtools/utils';
import { RouterLink, RouterLinkProps } from 'vue-router';

const props = defineProps<{
    to?: RouterLinkProps['to'];
    href?: string;
    icon?: FAIcon;
    title: string;
    description?: string;
}>();

const linkComponent = props.to ? RouterLink : 'a';
</script>

<template>
    <component :is="linkComponent" class="flex cursor-pointer flex-col hover:no-underline" :href="href" :to="to">
        <Card class="hover:border-basic-interactive flex-grow">
            <div class="flex items-center gap-3">
                <Avatar v-if="icon" color="accent" :icon="icon" size="S" />
                <div class="flex grow items-center gap-3">
                    <h2 class="text-display-s text-basic-primary my-0" v-html="escapeHtmlRelaxed(title)"></h2>
                    <slot name="title-after" />
                </div>
                <i class="fas fa-angle-right text-basic-bright" />
            </div>
            <div
                v-if="description"
                class="text-body-m text-basic-secondary mt-4"
                v-html="escapeHtmlRelaxed(description)"
            ></div>
            <slot />
        </Card>
    </component>
</template>
