<script setup lang="ts">
import { churchtoolsClient } from '@churchtools/churchtools-client';
import { SelectDropdown, SelectOption, SelectSection, SelectValue } from '@churchtools/styleguide';
import { FAIcon } from '@churchtools/utils';
import { onMounted, ref, watch } from 'vue';
const props = withDefaults(
    defineProps<{
        bold?: boolean;
        clear?: boolean;
        disabled?: boolean;
        error?: string | boolean | ErrorObj;
        helpLink?: string;
        iconBefore?: FAIcon;
        isDirty?: boolean;
        id?: string;
        options?: SelectSection[] | SelectOption[];
        label?: string;
        multiple?: boolean;
        note?: string;
        placeholder?: string;
        required?: boolean;
        showLabel?: boolean;
        size?: 'S' | 'M' | 'L';
        emitId?: boolean;
        modelValue?: SelectValue | SelectOption[] | SelectOption | string | number | object;
        add?: boolean;
        domainTypes?: string[];
    }>(),
    {
        id: 'select-search',
        domainTypes: () => ['person'],
        modelValue: () => [],
        placeholder: 'person.search.placeholder',
        showLabel: true,
        bold: true,
    },
);
const emit = defineEmits<{
    (event: 'update:modelValue', value: SelectOption[] | SelectOption | undefined): void;
    (event: 'action'): void;
}>();
const internValue = ref<SelectOption[]>([]);
onMounted(() => {
    internValue.value = props.modelValue;
});
watch(
    () => props.modelValue,
    () => {
        internValue.value = props.modelValue;
    },
);
const onAction = (item, selected, query) => {
    emit('action', item, selected, query);
};

const selectRef = ref();
const focus = () => {
    selectRef.value?.focus();
};
const searchForDomainType = (searchQuery: string) => {
    return new Promise(resolve => {
        if (searchQuery.length > 1) {
            const types = props.domainTypes.map(type => `domainTypes[]=${type}`);
            churchtoolsClient.get(`/search?query=${searchQuery}&${types.join('&')}`).then(result => {
                resolve(
                    result.map(person => ({
                        ...person,
                        name: person.title,
                        id: parseInt(person.domainIdentifier),
                    })),
                );
            });
        }
    });
};
defineExpose({ focus });
</script>
<template>
    <SelectDropdown
        v-bind="$props"
        ref="selectRef"
        v-model="internValue"
        :actions="add ? [{ key: 'add', label: 'add.person' }] : undefined"
        clear
        :search-function="searchForDomainType"
        @action="onAction"
        @update:model-value="emit('update:modelValue', $event)"
    >
        <slot />
    </SelectDropdown>
</template>
