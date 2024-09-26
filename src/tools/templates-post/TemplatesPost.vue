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
    usePosts,
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

type TemplateSchema = {
    name?: string;
    template?: string;
    title?: string;
};

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
const { createPost } = usePosts();
const { mutate: createP } = createPost();
const onCreatePost = () => {
    createP(
        {
            ...createData.value,
            content: contentText.value,
            title: titleText.value,
            imageIds: images.value.filter(i => i.checked).map(i => i.id),
        },
        {
            onSuccess: () => {
                successToast(txx('Beitrag wurde erstellt'));
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
        group: {
            title: postGroup.value.name,
        },
    };
    const visibilityOptions = [];
    visibilityOptions.push({
        dataCy: 'group-intern-visibility',
        label: t('post.visibility.group-intern'),
        id: 'group_intern' as const,
        description: getVisibilityHint({ ...partialPost, visibility: 'group_intern' }).hintLong,
    });
    visibilityOptions.push({
        dataCy: 'group-visible-visibility',
        label: t('post.visibility.group-visible'),
        id: 'group_visible' as const,
        description: getVisibilityHint({ ...partialPost, visibility: 'group_visible' }).hintLong,
    });
    return visibilityOptions;
});
const visibilityHint = computed(() => {
    return getVisibilityHint({
        visibility: createData.value.visibility,
        groupVisibility: postGroup.value?.settings.visibility ?? 'hidden',
        group: {
            title: postGroup.value?.name ?? '',
        },
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
        .map(pg => ({ ...pg.group, id: parseInt(pg.group.domainIdentifier), label: pg.group.title })),
);
</script>
<template>
    <ContentWrapper color="accent" icon="fas fa-newspaper" :title="txx('Beiträge mit Vorlagen')" max-width>
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
                    :label="txx('Template-Name')"
                    class="w-full"
                    @update:model-value="setDirty('name')"
                />
                <Input
                    v-model="title"
                    :label="txx('Beitragstitel')"
                    class="w-full"
                    @update:model-value="setDirty('title')"
                />
                <Textarea
                    v-model="content"
                    :label="txx('Inhalt')"
                    class="w-full"
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
                            <Button size="S" icon="fas fa-plus" text />
                        </DropdownMenu>
                    </template>
                </Textarea>
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
                    <Button v-else-if="content" size="S" icon="fas fa-save" @click="onCreateTemplate">
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
                        v-else-if="templateIsDirty && !!content"
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
            <div class="flex flex-col gap-3">
                <div class="flex flex-col gap-1">
                    <div class="text-body-m-emphasized">{{ txx('Platzhalter-Datensätze') }}</div>
                    <SectionedCard :items="datasetItems"></SectionedCard>
                    <div class="flex flex-wrap gap-x-3 gap-y-1">
                        <Tag
                            v-if="personError"
                            icon="fas fa-exclamation-triangle"
                            :label="personError?.message"
                            color="red"
                            size="S"
                        />
                        <Tag
                            v-if="groupError"
                            icon="fas fa-exclamation-triangle"
                            :label="groupError?.message"
                            color="red"
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
                    :label="t('newsfeed.create-post.group')"
                    :options="possibleGroups"
                    :placeholder="t('select.x', t('group'))"
                />
                <SelectDropdown
                    v-model="createData.visibility"
                    :clear="false"
                    data-cy="create-post-post-visibility"
                    emit-id
                    horizontal
                    :label="t('newsfeed.create-post.visibility.label')"
                    :options="visibilityOptions"
                >
                    <template #after>
                        <div class="mt-1 flex items-center gap-2 text-body-m text-basic-secondary">
                            <i :class="visibilityHint.icon"></i>
                            <span>{{ visibilityHint.hintShort }}</span>
                            <i v-tippy="visibilityHint.hintLong" class="fas fa-info-circle text-basic-tertiary" />
                        </div>
                    </template>
                </SelectDropdown>
                <Card class="-mt-px">
                    <DataOption
                        v-if="postGroup"
                        size="L"
                        :domain-object="transformGroupToDomainObject(postGroup)"
                        :title="postGroup.name"
                    />
                    <div class="pt-4 text-body-m-emphasized" v-html="titlePreview || txx('Betreff')"></div>
                    <div
                        class="pt-2"
                        v-html="
                            contentPreview ? mdToHtml(contentPreview, { simplifiedAutoLink: false }) : txx('Inhalt')
                        "
                    ></div>
                    <div v-if="images.length" class="mt-4">
                        <div class="mb-1 text-body-m-emphasized">
                            {{ txx('Folgende Fotos werden dem Beitrag hinzugefügt:') }}
                        </div>
                        <div class="divide-y divide-solid">
                            <div v-for="image in images" :key="image.id">
                                <DataOption
                                    :domain-object="image"
                                    :title="txx(`Foto von „${image.name}”`)"
                                    class="-mx-2 cursor-pointer px-2 py-2 hover:bg-basic-b-pale"
                                    :icon="
                                        image.checked
                                            ? 'fas fa-square-check text-accent-bright'
                                            : 'far fa-square text-basic-secondary'
                                    "
                                    @click="image.checked = !image.checked"
                                />
                            </div>
                        </div>
                    </div>
                </Card>
                <div class="flex justify-end">
                    <Button
                        icon="fas fa-newspaper"
                        :disabled="personError || groupError || !createData.groupId || !titleText"
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
