import { useCustomModuleDataValuesMutations, useToasts } from '@churchtools/utils';
import { MaybeRef, ref } from 'vue';
import { txx } from '../utils';
import useModule from './useModule';

type TemplateSchema = {
    name?: string;
    title?: string;
    template?: string;
};

export default function useContentWithPlaceholder(catId: MaybeRef<number | undefined>) {
    const { moduleId } = useModule();
    const { successToast } = useToasts();
    const { updateCustomDataValue, createCustomDataValue } = useCustomModuleDataValuesMutations<TemplateSchema>(
        moduleId,
        catId,
    );

    const templateIsDirty = ref(false);
    const selectedTemplate = ref<TemplateSchema | undefined>();

    const templateName = ref<string>('');
    const title = ref<string>('');
    const content = ref<string>('');

    const onUpdateTemplate = async () => {
        await updateCustomDataValue({
            ...selectedTemplate.value,
            name: templateName.value,
            template: content.value,
            title: title.value,
        });
        successToast(txx('Vorlage wurde aktualisiert'));
        templateIsDirty.value = false;
    };

    const onCreateTemplate = async () => {
        await createCustomDataValue({
            name: templateName.value,
            template: content.value,
            title: title.value,
        });
        successToast(txx('Vorlage wurde angelegt'));
        templateIsDirty.value = false;
    };

    const setDirty = (type: 'name' | 'title' | 'template') => {
        if (type === 'name') {
            templateIsDirty.value = templateName.value !== selectedTemplate.value?.name;
        } else if (type === 'title') {
            templateIsDirty.value = title.value !== selectedTemplate.value?.title;
        } else if (type === 'template') {
            templateIsDirty.value = content.value !== selectedTemplate.value?.template;
        }
    };

    const onClear = () => {
        content.value = '';
        title.value = '';
        if (!selectedTemplate.value) {
            templateIsDirty.value = false;
        }
    };

    return {
        templateIsDirty,
        templateName,
        title,
        content,
        selectedTemplate,
        onUpdateTemplate,
        onCreateTemplate,
        onClear,
        setDirty,
    };
}
