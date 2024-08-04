import { CustomModuleDataCategoryCreate, useCustomModuleDataCategoriesQuery } from '@churchtools/utils';
import { computed } from 'vue';
import { txx } from '../utils';
import useModule from './useModule';

export default function useModuleSettings() {
    const { moduleId } = useModule();

    const { data: categories } = useCustomModuleDataCategoriesQuery(moduleId);

    const neededCategories = computed(() => {
        const needed: Omit<CustomModuleDataCategoryCreate, 'customModuleId'>[] = [
            {
                shorty: 'templates',
                name: txx('Vorlagen'),
                description: txx('Template mit Placeholdern'),
            },
        ];
        return needed.map(neededC => ({
            ...neededC,
            neededToCreate: !categories.value?.find(c => c.shorty === neededC.shorty),
        }));
    });

    const neededCategoriesCount = computed(() => neededCategories.value.filter(c => c.neededToCreate).length);

    return { neededCategories, neededCategoriesCount };
}
