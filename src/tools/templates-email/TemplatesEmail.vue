<script setup lang="ts">
import { churchtoolsClient, errorHelper } from '@churchtools/churchtools-client';
import { Button, Card, ContentWrapper, DataOption, Input, SelectDropdown, Textarea } from '@churchtools/styleguide';
import {
    DomainObjectGroup,
    DomainObjectPerson,
    flattenGroup,
    useCustomModuleDataCategoriesQuery,
    useCustomModuleDataValuesMutations,
    useCustomModuleDataValuesQuery,
    useGroupQuery,
    useMarkdown,
    usePersonsQuery,
    useToasts,
} from '@churchtools/utils';
import { computed, ref } from 'vue';
import SelectSearch from '../../components/SelectSearch.vue';
import useModule from '../../composables/useModule';
import { txx } from '../../utils';

const groupDO = ref<DomainObjectGroup | null>();
const { data: group } = useGroupQuery(
    computed(() => (groupDO.value?.domainIdentifier ? parseInt(groupDO.value?.domainIdentifier) : undefined)),
    { include: ['roles'] },
);
const groupError = computed(() => {
    if (contentWithPlaceholder.value.groupPlaceholder?.length && !groupDO.value) {
        return { message: txx('Gruppe ist nicht ausgewählt'), date: new Date() };
    }
    return undefined;
});

const personDO = ref<DomainObjectPerson | null>();
const personQuery = computed(() => ({
    ids: personDO.value?.domainIdentifier ? [parseInt(personDO.value?.domainIdentifier)] : undefined,
}));
const { data } = usePersonsQuery(personQuery);
const person = computed(() => data.value?.pages[0].persons[0]);
const personError = computed(() => {
    if (editedTemplate.value && !personDO.value) {
        return { message: txx('Person ist nicht ausgewählt'), date: new Date() };
    }
    return undefined;
});

const selectedTemplate = ref<undefined | (typeof templates.value)[0]>();
const onSelectTemplate = (template: (typeof templates.value)[0]) => {
    editedTemplate.value = template?.template;
    subject.value = template?.subject;
    templateName.value = template?.name;
};
const editedTemplate = ref<string | undefined>();
const subject = ref<string | undefined>();
const templateName = ref<string | undefined>();
type TemplateSchema = {
    name?: string;
    template?: string;
    subject?: string;
};
const { moduleId } = useModule();
const { data: categories } = useCustomModuleDataCategoriesQuery(moduleId);

const templateCategory = computed(() => categories.value?.find(cat => cat.shorty === 'templates-email'));
const catId = computed(() => templateCategory.value?.id);

const { data: dataValues } = useCustomModuleDataValuesQuery<TemplateSchema>(moduleId, catId);
const templates = computed(() => (dataValues.value ?? []).map(dv => ({ ...dv, label: dv.name })));

const contentWithPlaceholder = computed(() => {
    // find placeholder like {{person.name}} in template
    const placeholder = /{{(.*?)}}/g;
    const matches = editedTemplate.value?.match(placeholder);
    if (!matches) return { content: editedTemplate.value };
    let content = editedTemplate.value;
    let preview = editedTemplate.value;
    const groupPlaceholder: string[] = [];
    const personPlaceholder: string[] = [];
    matches.forEach(match => {
        const [prefix, key] = match.replace('{{', '').replace('}}', '').split('.');
        if (prefix === 'person') {
            const value = person.value?.[key] ?? [prefix, key].join('.');
            content = content?.replace(match, value);
            preview = preview?.replace(
                match,
                key === 'id'
                    ? value
                    : `<span class="placeholder ${person.value?.[key] ? '' : 'missing'}">${value}</span>`,
            );
            personPlaceholder.push(key);
        } else if (prefix === 'group') {
            const flatGroup = flattenGroup(group.value);
            const value = flatGroup?.[key] ?? [prefix, key].join('.');
            content = content?.replace(match, value);
            preview = preview?.replace(
                match,
                key === 'id' ? value : `<span class="placeholder ${flatGroup?.[key] ? '' : 'missing'}">${value}</span>`,
            );
            groupPlaceholder.push(key);
        }
    });
    return { content, preview, groupPlaceholder, personPlaceholder };
});

const { updateCustomDataValue, createCustomDataValue } = useCustomModuleDataValuesMutations<TemplateSchema>(
    moduleId,
    catId,
);
const onUpdateTemplate = async () => {
    await updateCustomDataValue({ ...selectedTemplate.value, template: editedTemplate.value, subject: subject.value });
    successToast(txx('Vorlage wurde aktualisiert'));
    templateIsDirty.value = false;
};
const onCreateTemplate = async () => {
    await createCustomDataValue({ name: templateName.value, template: editedTemplate.value, subject: subject.value });
    successToast(txx('Vorlage wurde angelegt'));
    templateIsDirty.value = false;
};

const { mdToHtml } = useMarkdown();
const { errorToast, successToast } = useToasts();
const onSendEmail = async () => {
    try {
        churchtoolsClient.oldApi('churchdb/ajax', 'sendEMailToPersonIds', {
            ids: person.value?.id,
            betreff: subject.value,
            inhalt: mdToHtml(contentWithPlaceholder.value?.content),
        });
        successToast('E-Mail wurde versendet');
        groupDO.value = null;
        personDO.value = null;
    } catch (error) {
        errorToast(errorHelper.getTranslatedErrorMessage(error));
    }
};

const templateIsDirty = ref(false);
const setDirty = (type: 'name' | 'subject' | 'template') => {
    if (type === 'name') {
        templateIsDirty.value = templateName.value !== selectedTemplate.value?.name;
    } else if (type === 'subject') {
        templateIsDirty.value = subject.value !== selectedTemplate.value?.subject;
    } else if (type === 'template') {
        templateIsDirty.value = editedTemplate.value !== selectedTemplate.value?.template;
    }
};
const onClear = () => {
    editedTemplate.value = '';
    subject.value = '';
    if (!selectedTemplate.value) {
        templateIsDirty.value = false;
    }
};
</script>

<template>
    <ContentWrapper color="accent" icon="fas fa-envelope" :title="txx('E-Mails mit Vorlagen')" max-width>
        <div class="grid grid-cols-3 gap-4">
            <SelectSearch v-model="personDO" :error="personError" :label="txx('Person')" />
            <SelectSearch v-model="groupDO" :error="groupError" :label="txx('Gruppe')" :domain-types="['group']" />
            <SelectDropdown
                v-if="templates.length"
                v-model="selectedTemplate"
                :label="txx('Vorlage')"
                :options="templates"
                @update:model-value="onSelectTemplate"
            />
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-3">
                <Input
                    v-model="templateName"
                    :label="txx('Template-Name')"
                    class="w-full"
                    @update:model-value="setDirty('name')"
                />
                <Input
                    v-model="subject"
                    :label="txx('E-Mail-Betreff')"
                    class="w-full"
                    @update:model-value="setDirty('subject')"
                />
                <Textarea
                    v-model="editedTemplate"
                    :label="txx('Inhalt')"
                    class="w-full"
                    @update:model-value="setDirty('template')"
                />
                <div class="flex items-center gap-2">
                    <Button
                        v-if="selectedTemplate"
                        :disabled="!templateIsDirty"
                        size="S"
                        icon="fas fa-save"
                        @click="onUpdateTemplate"
                    >
                        {{ txx('Vorlage aktualisieren') }}
                    </Button>
                    <Button v-else-if="editedTemplate" size="S" icon="fas fa-save" @click="onCreateTemplate">
                        {{ txx('Vorlage anlegen') }}
                    </Button>
                    <Button
                        v-if="selectedTemplate && templateIsDirty"
                        size="S"
                        outlined
                        color="basic"
                        icon="fas fa-undo"
                        @click="onSelectTemplate(selectedTemplate)"
                    >
                        {{ txx('Verwerfen') }}
                    </Button>
                    <Button
                        v-else-if="templateIsDirty && !!editedTemplate"
                        size="S"
                        outlined
                        color="basic"
                        icon="fas fa-xmark-circle"
                        @click="onClear"
                    >
                        {{ txx('Verwerfen') }}
                    </Button>
                </div>
            </div>
            <div class="flex flex-col gap-2 pt-6">
                <Card class="-mt-px">
                    <DataOption
                        size="L"
                        :domain-object="personDO ?? { initials: 'A', domainType: 'person' }"
                        :title="personDO?.title ?? txx('Addressat')"
                        :note="personDO ? person?.email : txx('E-Mail-Adresse')"
                    />
                    <div class="pt-4 text-body-m-emphasized">{{ subject || txx('Betreff') }}</div>
                    <div
                        class="pt-2"
                        v-html="
                            mdToHtml(contentWithPlaceholder.preview, { simplifiedAutoLink: false }) || txx('Inhalt')
                        "
                    ></div>
                </Card>
                <div class="flex justify-end">
                    <Button icon="fas fa-envelope" :disabled="groupError || personError" @click="onSendEmail">
                        {{ txx('Senden') }}
                    </Button>
                </div>
            </div>
        </div>
    </ContentWrapper>
</template>
<style scoped>
:deep(.placeholder) {
    color: var(--accent-bright);
    background: var(--accent-b-pale);
    padding: 1px 4px;
    border-radius: 4px;
}
:deep(.missing) {
    background: var(--error-b-pale);
    color: var(--error-bright);
}
</style>
