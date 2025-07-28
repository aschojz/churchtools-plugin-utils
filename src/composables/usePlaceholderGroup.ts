import { DomainObjectGroup, t, useDbFieldsQuery, useGroupsQueryAllPages } from '@churchtools/utils';
import { computed, Ref } from 'vue';
import { txx } from '../utils';

export function usePlaceholderGroup(groupDO: Ref<DomainObjectGroup[]>, groupCount: Ref<number>) {
    const groupsQuery = computed(() => ({
        ids: groupDO.value.filter(g => g.domainIdentifier).map(g => g.domainIdentifier && parseInt(g.domainIdentifier)),
    }));

    const { data } = useGroupsQueryAllPages(groupsQuery, { enabled: () => !!groupDO.value.length });
    const groups = computed(() => {
        const groups = data.value;
        if (!groups) {
            return undefined;
        }
        return groups.map(group => {
            return {
                ...group,
            };
        });
    });
    const groupError = computed(() => {
        const missingGroup = groupCount.value - groupDO.value.length;
        if (missingGroup > 0) {
            return { message: txx(`Es fehlen noch Gruppen: ${missingGroup}`), date: new Date() };
        }
        return undefined;
    });

    const { groupFields, customGroupFields } = useDbFieldsQuery();

    const groupPlaceholder = computed(() => {
        return [
            { id: 'group.0.id', label: txx('ID') },
            ...[...groupFields.value, ...customGroupFields.value].map(field => ({
                id: `group.0.${field.key}`,
                label: t(field.name, false),
            })),
        ];
    });
    return { groups, groupError, groupPlaceholder };
}
