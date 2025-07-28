<script setup lang="ts">
import {
    ActionItem,
    Button,
    Card,
    ContentWrapper,
    DataOption,
    DropdownItem,
    DropdownMenu,
    Input,
    LinkItem,
    searchForm,
    SectionedCard,
    SelectDropdown,
    Tag,
    Textarea,
    useFileUpload,
} from '@churchtools/styleguide';
import {
    CTFile,
    DomainObjectAny,
    PostCreate,
    t,
    transformGroupToDomainObject,
    useCustomModuleDataCategoriesQuery,
    useCustomModuleDataValuesQuery,
    useGroupQuery,
    useMarkdown,
    usePostHelpers,
    usePostMutations,
    useToasts,
} from '@churchtools/utils';
import { computed, ref } from 'vue';
import useContentWithPlaceholder from '../../composables/useContentWithPlaceholder';
import useModule from '../../composables/useModule';
import { usePlaceholderGroup } from '../../composables/usePlaceholderGroup';
import { usePlaceholderPerson } from '../../composables/usePlaceholderPerson';
import { usePostGroups } from '../../composables/usePostGroups';
import useTemplates from '../../composables/useTemplates';
import { txx } from '../../utils';

const { moduleId } = useModule();
const { data: categories } = useCustomModuleDataCategoriesQuery(moduleId);

const templateCategory = computed(() => categories.value?.find(cat => cat.shorty === 'templates-post'));
const catId = computed(() => templateCategory.value?.id);

const { data: dataValues } = useCustomModuleDataValuesQuery<TemplateSchema>(moduleId, catId);
const templates = computed(() => (dataValues.value ?? []).map(dv => ({ ...dv, label: dv.name })));

type TemplateSchema = { name?: string; template?: string; title?: string };

const onSelectTemplate = (template: TemplateSchema) => {
    templateName.value = template?.name;
    content.value = template?.template;
    title.value = template?.title;
};

const datasets = ref<DomainObjectAny[]>([]);
const { personError, persons, personPlaceholder } = usePlaceholderPerson(
    computed(() => datasets.value.filter(ds => ds.domainType === 'person')),
    computed(() => datasetCount.value.person),
);
const { groupError, groupPlaceholder, groups } = usePlaceholderGroup(
    computed(() => datasets.value.filter(ds => ds.domainType === 'group')),
    computed(() => datasetCount.value.group),
);

const { mdToHtml } = useMarkdown();

const placeholderData = computed(() => ({ person: persons.value, group: groups.value }));

const {
    selectedTemplate,
    onCreateTemplate,
    onUpdateTemplate,
    templateIsDirty,
    templateName,
    title,
    content,
    onClear,
    setDirty,
} = useTemplates(catId);
const { text: titleText, preview: titlePreview } = useContentWithPlaceholder(title, placeholderData);
const {
    text: contentText,
    preview: contentPreview,
    datasetCount,
} = useContentWithPlaceholder(content, placeholderData);

const { successToast } = useToasts();
const { createPost } = usePostMutations();
const onCreatePost = () => {
    createPost(
        {
            ...createData.value,
            content: contentText.value ?? null,
            title: titleText.value,
            imageIds: images.value.filter(i => i.checked).map(i => i.id),
        },
        {
            onSuccess: () => {
                successToast(txx('Beitrag wurde erstellt'));
                datasets.value = [];
            },
        },
    );
};

const onAddPlaceholder = (text: 'content' | 'title', placeholder: DropdownItem) => {
    if ('content' === text) {
        content.value += `{{${placeholder.id}}}`;
    } else {
        title.value += `{{${placeholder.id}}}`;
    }
};

const images = ref<(CTFile & { checked: boolean; name: string })[]>([]);
const { uploadFile } = useFileUpload('/files/unknown/post-upload');
const uploadImage = (imageUrl: string, id: string, name: string) => {
    fetch(imageUrl)
        .then(res => res.blob()) // Gets the response and returns it as a blob
        .then(async blob => {
            const file = await uploadFile({ file: blob, id });
            if (file) {
                images.value.push({ ...file, checked: true, name });
            }
        });
};

const createData = ref<Partial<PostCreate>>({ visibility: 'group_intern' });

const { getVisibilityHint } = usePostHelpers();
const postGroupId = computed(() => createData.value.groupId);
const { data: postGroup } = useGroupQuery(postGroupId);
const visibilityOptions = computed(() => {
    if (!postGroup.value) {
        return [];
    }
    const partialPost = {
        groupVisibility: postGroup.value.settings.visibility,
        group: { title: postGroup.value.name },
    };
    const visibilityOptions = [];
    visibilityOptions.push({
        dataCy: 'group-intern-visibility',
        label: txx('Nur Gruppenmitglieder'),
        id: 'group_intern' as const,
        description: getVisibilityHint({ ...partialPost, visibility: 'group_intern' }).hintLong,
    });
    visibilityOptions.push({
        dataCy: 'group-visible-visibility',
        label: txx('Wie Gruppe'),
        id: 'group_visible' as const,
        description: getVisibilityHint({ ...partialPost, visibility: 'group_visible' }).hintLong,
    });
    return visibilityOptions;
});
const visibilityHint = computed(() => {
    return getVisibilityHint({
        visibility: createData.value.visibility,
        groupVisibility: postGroup.value?.settings.visibility ?? 'hidden',
        group: { title: postGroup.value?.name ?? '' },
    });
});

const datasetItems = computed(() => {
    const items: (ActionItem | LinkItem)[] = [];
    const counts = {};
    datasets.value.forEach(dataset => {
        counts[dataset.domainType] = (counts[dataset.domainType] ?? -1) + 1;
        items.push({
            type: 'link',
            value: dataset.title,
            description: `${dataset.domainType}.${counts[dataset.domainType]}`,
            primaryObject: { domainObject: dataset },
            actions: [
                {
                    icon: 'fas fa-external-link-alt',
                    label: txx('Profil öffnen'),
                    type: 'button',
                    onClick: () => {
                        window.open(dataset.frontendUrl, '_blank');
                    },
                },
                {
                    icon: 'fas fa-xmark',
                    label: txx('Löschen'),
                    type: 'button',
                    onClick: () => {
                        datasets.value = datasets.value.filter(
                            ds =>
                                !(
                                    ds.domainIdentifier === dataset.domainIdentifier &&
                                    ds.domainType === dataset.domainType
                                ),
                        );
                    },
                },
            ],
        });
    });
    items.push({
        type: 'action',
        icon: 'fas fa-plus',
        label: txx('Weiterer Datensatz'),
        onClick: async () => {
            const result = await searchForm({
                domainTypes: ['person', 'group'],
                context: txx('Platzhalter-Datensatz'),
                title: txx('Datensatz suchen'),
                recentSearchFormat: 'numeric',
                recentSearchKey: 'recent-searches',
            });
            if (result) {
                datasets.value.push(result);
                uploadImage(
                    result.imageUrl + `?crop=original`,
                    `image-${result.domainType}-${result.domainIdentifier}`,
                    result.title,
                );
            }
        },
    });
    return items;
});

const { data: postGroups } = usePostGroups();
const possibleGroups = computed(() =>
    (postGroups.value ?? [])
        .filter(pg => pg.type === 'postPossible')
        .map(pg => ({
            ...pg.group,
            id: parseInt(pg.group.domainIdentifier),
            label: pg.group.title,
            icon: 'fas fa-users' as const,
        })),
);
</script>
<template>
    <ContentWrapper color="accent" icon="fas fa-newspaper" max-width :title="txx('Beiträge mit Vorlagen')">
        <div class="grid grid-cols-2 items-start gap-4">
            <div class="flex flex-col gap-3">
                <SelectDropdown
                    v-if="templates.length"
                    v-model="selectedTemplate"
                    :label="txx('Vorlage')"
                    :options="templates"
                    @update:model-value="onSelectTemplate"
                />
                <Input
                    v-model="templateName"
                    class="w-full"
                    :label="txx('Template-Name')"
                    @update:model-value="setDirty('name')"
                />
                <Input
                    v-model="title"
                    class="w-full"
                    :label="txx('Beitragstitel')"
                    @update:model-value="setDirty('title')"
                />
                <Textarea
                    v-model="content"
                    class="w-full"
                    :label="txx('Inhalt')"
                    @update:model-value="setDirty('template')"
                >
                    <template #label-end>
                        <DropdownMenu
                            :menu-items="[
                                { title: txx('Personen'), items: personPlaceholder },
                                { title: txx('Gruppen'), items: groupPlaceholder },
                            ]"
                            @click="onAddPlaceholder('content', $event)"
                        >
                            <Button icon="fas fa-plus" size="S" text />
                        </DropdownMenu>
                    </template>
                </Textarea>
                <div class="flex items-center gap-2">
                    <Button
                        v-if="selectedTemplate"
                        :disabled="!templateIsDirty"
                        icon="fas fa-save"
                        size="S"
                        @click="onUpdateTemplate"
                    >
                        {{ txx('Vorlage aktualisieren') }}
                    </Button>
                    <Button v-else-if="content" icon="fas fa-save" size="S" @click="onCreateTemplate">
                        {{ txx('Vorlage anlegen') }}
                    </Button>
                    <Button
                        v-if="selectedTemplate && templateIsDirty"
                        color="basic"
                        icon="fas fa-undo"
                        outlined
                        size="S"
                        @click="onSelectTemplate(selectedTemplate)"
                    >
                        {{ txx('Verwerfen') }}
                    </Button>
                    <Button
                        v-else-if="templateIsDirty && !!content"
                        color="basic"
                        icon="fas fa-xmark-circle"
                        outlined
                        size="S"
                        @click="onClear"
                    >
                        {{ txx('Verwerfen') }}
                    </Button>
                </div>
            </div>
            <div class="flex flex-col gap-3">
                <div class="flex flex-col gap-1">
                    <div class="text-body-m-emphasized">{{ txx('Platzhalter-Datensätze') }}</div>
                    <SectionedCard :items="datasetItems"></SectionedCard>
                    <div class="flex flex-wrap gap-x-3 gap-y-1">
                        <Tag
                            v-if="personError"
                            color="red"
                            icon="fas fa-exclamation-triangle"
                            :label="personError?.message"
                            size="S"
                        />
                        <Tag
                            v-if="groupError"
                            color="red"
                            icon="fas fa-exclamation-triangle"
                            :label="groupError?.message"
                            size="S"
                        />
                    </div>
                </div>
                <SelectDropdown
                    v-model="createData.groupId"
                    :clear="false"
                    :domain-types="['group']"
                    emit-id
                    horizontal
                    :label="txx('Gruppe für den Beitrag')"
                    :options="possibleGroups"
                    :placeholder="txx('Gruppe auswählen')"
                />
                <SelectDropdown
                    v-model="createData.visibility"
                    :clear="false"
                    :disabled="!createData.groupId"
                    emit-id
                    horizontal
                    :label="txx('Sichtbarkeit des Beitrags')"
                    :options="visibilityOptions"
                >
                    <template #after>
                        <div
                            class="text-body-m text-basic-secondary mt-1 flex items-center gap-2"
                            :class="{ 'opacity-0': !createData.groupId }"
                        >
                            <i :class="visibilityHint.icon"></i>
                            <span>{{ t(visibilityHint.hintShort) }}</span>
                            <i v-tippy="t(visibilityHint.hintLong)" class="fas fa-info-circle text-basic-tertiary" />
                        </div>
                    </template>
                </SelectDropdown>
                <Card class="-mt-px">
                    <DataOption
                        v-if="postGroup"
                        :domain-object="transformGroupToDomainObject(postGroup)"
                        size="L"
                        :title="postGroup.name"
                    />
                    <div class="text-body-m-emphasized pt-4" v-html="titlePreview || txx('Betreff')"></div>
                    <div
                        class="pt-2"
                        v-html="
                            contentPreview ? mdToHtml(contentPreview, { simplifiedAutoLink: false }) : txx('Inhalt')
                        "
                    ></div>
                    <div v-if="images.length" class="mt-4">
                        <div class="text-body-m-emphasized mb-1">
                            {{ txx('Folgende Fotos werden dem Beitrag hinzugefügt:') }}
                        </div>
                        <div class="divide-y divide-solid">
                            <div v-for="image in images" :key="image.id">
                                <DataOption
                                    class="hover:bg-basic-b-pale -mx-2 cursor-pointer px-2 py-2"
                                    :domain-object="image"
                                    :icon="
                                        image.checked
                                            ? 'fas fa-square-check text-accent-bright'
                                            : 'far fa-square text-basic-secondary'
                                    "
                                    :title="txx(`Foto von „${image.name}”`)"
                                    @click="image.checked = !image.checked"
                                />
                            </div>
                        </div>
                    </div>
                </Card>
                <div class="flex justify-end">
                    <Button
                        :disabled="
                            personError !== undefined || groupError !== undefined || !createData.groupId || !titleText
                        "
                        icon="fas fa-newspaper"
                        @click="onCreatePost"
                    >
                        {{ txx('Veröffentlichen') }}
                    </Button>
                </div>
                <div id="myImg"></div>
            </div>
        </div>
    </ContentWrapper>
</template>
<style scoped>
:deep(.placeholder) {
    color: var(--color-accent-bright);
    background: var(--color-accent-b-pale);
    padding: 1px 4px;
    border-radius: 4px;
}
:deep(.missing) {
    background: var(--color-error-b-pale);
    color: var(--color-error-bright);
}
</style>
