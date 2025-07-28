import { flattenGroup, Group, Person } from '@churchtools/utils';
import { computed, Ref, ref, watch } from 'vue';

export default function useContentWithPlaceholder(
    content: Ref<string | undefined>,
    data: Ref<{ person?: Person[]; group?: Group[] }>,
    options = { highlightId: true },
) {
    const datasetCount = ref<{ person: Set<string>; group: Set<string> }>({ person: new Set(), group: new Set() });
    const preview = ref<string | undefined>();
    const text = ref<string | undefined>();

    const computePlaceholder = () => {
        const placeholderRegex = /{{(.*?)}}/g;
        const matches = content.value?.match(placeholderRegex);
        text.value = content.value;
        preview.value = content.value;

        matches?.forEach(match => {
            const [prefix, index, key] = match.replace('{{', '').replace('}}', '').split('.');
            if (prefix === 'person') {
                const value = data.value.person?.[index]?.[key] ?? [prefix, index, key].join('.');
                text.value = text.value?.replace(match, value);
                preview.value = preview.value?.replace(
                    match,
                    key !== 'id' || options.highlightId
                        ? `<span class="placeholder ${data.value.person?.[index]?.[key] ? '' : 'missing'}">${value}</span>`
                        : value,
                );
                datasetCount.value.person.add(index);
            } else if (prefix === 'group') {
                const flatGroup = flattenGroup(data.value.group?.[index]);
                const value = flatGroup?.[key as keyof typeof flatGroup] ?? [prefix, index, key].join('.');
                text.value = text.value?.replace(match, value);
                preview.value = preview.value?.replace(
                    match,
                    key === 'id' || options.highlightId
                        ? `<span class="placeholder ${flatGroup?.[key] ? '' : 'missing'}">${value}</span>`
                        : value,
                );
                datasetCount.value.group.add(index);
            }
        });
    };
    watch(content, () => {
        datasetCount.value = { person: new Set(), group: new Set() };
    });
    watch([content, () => data.value.person, () => data.value.group], () => {
        computePlaceholder();
    });

    return {
        content,
        text,
        preview,
        datasetCount: computed(() => ({
            person: datasetCount.value.person.size,
            group: datasetCount.value.group.size,
        })),
    };
}
