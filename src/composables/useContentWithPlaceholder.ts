import { flattenGroup, Group, Person } from '@churchtools/utils';
import { Ref, ref, watch } from 'vue';

export default function useContentWithPlaceholder(
    content: Ref<string | undefined>,
    data: Ref<{ person?: Person[]; group?: Group[] }>,
    options = { highlightId: true },
) {
    const placeholder = ref<{ person?: string[]; group?: string[] }>({});
    const preview = ref<string | undefined>();
    const text = ref<string | undefined>();

    const computePlaceholder = () => {
        const placeholderRegex = /{{(.*?)}}/g;
        const matches = content.value?.match(placeholderRegex);
        text.value = content.value;
        preview.value = content.value;
        placeholder.value['person'] = [];
        placeholder.value['group'] = [];

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
                placeholder.value.person?.push(key);
            } else if (prefix === 'group') {
                const flatGroup = flattenGroup(data.value.group[index]);
                const value = flatGroup?.[key] ?? [prefix, index, key].join('.');
                text.value = text.value?.replace(match, value);
                preview.value = preview.value?.replace(
                    match,
                    key === 'id' || options.highlightId
                        ? `<span class="placeholder ${flatGroup?.[key] ? '' : 'missing'}">${value}</span>`
                        : value,
                );
                placeholder.value.group?.push(key);
            }
        });
    };
    watch([content, () => data.value.person], () => {
        computePlaceholder();
    });

    return {
        content,
        text,
        preview,
        placeholder,
    };
}
