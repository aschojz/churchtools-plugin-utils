import { useCustomModuleQuery } from '@churchtools/utils';
import { computed } from 'vue';

export default function useModule() {
    const { data: customModule } = useCustomModuleQuery(computed(() => 'utils'));
    const moduleId = computed(() => customModule.value?.id);

    return { customModule, moduleId };
}
