<script setup lang="ts">
import {
    Button,
    Card,
    ContentWrapper,
    DataOption,
    DropdownItem,
    DropdownMenu,
    Input,
    SelectDropdown,
    Textarea,
    useFileUpload,
} from '@churchtools/styleguide';
import {
    CTFile,
    PostCreate,
    t,
    transformGroupToDomainObject,
    useCustomModuleDataCategoriesQuery,
    useCustomModuleDataValuesQuery,
    useGroupQuery,
    useMarkdown,
    usePostHelpers,
    usePosts,
} from '@churchtools/utils';
import { computed, ref, watch } from 'vue';
import SelectSearch from '../../components/SelectSearch.vue';
import useContentWithPlaceholder from '../../composables/useContentWithPlaceholder';
import useModule from '../../composables/useModule';
import { usePlaceholderPerson } from '../../composables/usePlaceholderPerson';
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

const { personDO, personError, person, personPlaceholder } = usePlaceholderPerson(
    computed(() => !!placeholder.value.person?.length),
);

const { mdToHtml } = useMarkdown();

const placeholderData = computed(() => ({ person: person.value }));

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
const { text: contentText, preview: contentPreview, placeholder } = useContentWithPlaceholder(content, placeholderData);

const { createPost } = usePosts();
const { mutate: createP } = createPost();
const onCreatePost = () => {
    createP({
        groupId: 136,
        content: contentText.value,
        title: titleText.value,
        visibility: 'group_intern',
        imageIds: images.value.filter(i => i.checked).map(i => i.id),
    });
};

const onAddPlaceholder = (text: 'content' | 'title', placeholder: DropdownItem) => {
    if ('content' === text) {
        content.value += `{{${placeholder.id}}}`;
    } else {
        title.value += `{{${placeholder.id}}}`;
    }
};

const images = ref<(CTFile & { checked: boolean })[]>([]);
const { uploadFile } = useFileUpload('/files/unknown/post-upload');
const uploadImage = (imageUrl: string, id: string) => {
    fetch(imageUrl)
        .then(res => res.blob()) // Gets the response and returns it as a blob
        .then(async blob => {
            const file = await uploadFile({ file: blob, id });
            if (file) {
                images.value.push({ ...file, checked: true });
            }
        });
};
watch(
    () => personDO.value?.domainIdentifier,
    () => {
        if (personDO.value?.domainIdentifier && personDO.value?.imageUrl) {
            uploadImage(personDO.value?.imageUrl + `?crop=original`, `image-${personDO.value.domainIdentifier}`);
        }
    },
);

const createData = ref<Partial<PostCreate>>({ groupId: 136, visibility: 'group_intern' });

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
</script>
<template>
    <ContentWrapper color="accent" icon="fas fa-newspaper" :title="txx('Beiträge mit Vorlagen')" max-width>
        <div class="grid grid-cols-2 gap-4">
            <SelectSearch v-model="personDO" :error="personError" :label="txx('Person')" />
            <SelectDropdown
                v-if="templates.length"
                v-model="selectedTemplate"
                :label="txx('Vorlage')"
                :options="templates"
                @update:model-value="onSelectTemplate"
            />
        </div>
        <div class="grid grid-cols-2 items-start gap-4">
            <div class="flex flex-col gap-3">
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
                            :menu-items="[{ items: personPlaceholder }]"
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
            <div class="flex flex-col gap-2">
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
                    <div class="mt-4 divide-y divide-solid">
                        <div v-for="image in images" :key="image.id">
                            <DataOption
                                :domain-object="image"
                                :title="'#' + image.id"
                                :icon="
                                    image.checked
                                        ? 'fas fa-square-check text-success-bright'
                                        : 'far fa-square text-basic-secondary'
                                "
                                @click="image.checked = !image.checked"
                            />
                        </div>
                    </div>
                </Card>
                <div class="flex justify-end">
                    <Button icon="fas fa-newspaper" :disabled="personError" @click="onCreatePost">
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
