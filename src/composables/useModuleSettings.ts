import { useCustomModuleDataCategoriesQuery } from '@churchtools/utils';
import { computed } from 'vue';
import { needed } from '../config';
import useModule from './useModule';

export default function useModuleSettings() {
    const { moduleId } = useModule();
    const { data: categories } = useCustomModuleDataCategoriesQuery(moduleId);

    const neededCategories = computed(() => {
        return needed.map(neededC => ({
            ...neededC,
            neededToCreate: !categories.value?.find(c => c.shorty === neededC.shorty),
        }));
    });

    const neededCategoriesCount = computed(() => neededCategories.value.filter(c => c.neededToCreate).length);

    return { neededCategories, neededCategoriesCount };
}
