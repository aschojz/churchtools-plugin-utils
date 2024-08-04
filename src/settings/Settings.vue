<script setup lang="ts">
import { Button, Card, ContentWrapper } from '@churchtools/styleguide';
import { CustomModuleDataCategoryCreate, useCustomModuleDataCategoryMutations, useToasts } from '@churchtools/utils';
import useModule from '../composables/useModule';
import useModuleSettings from '../composables/useModuleSettings';
import { txx } from '../utils';

const { neededCategories } = useModuleSettings();
const { successToast } = useToasts();
const { moduleId } = useModule();

const { createDataCategory } = useCustomModuleDataCategoryMutations(moduleId);
const createCategory = async (category: CustomModuleDataCategoryCreate) => {
    await createDataCategory(category);
    successToast(txx('Kategorie erstellt'));
};
</script>
<template>
    <ContentWrapper icon="fas fa-cog" :title="txx('Einstellungen')" max-width>
        <Card>
            <template #full>
                <div class="flex flex-col divide-y">
                    <div
                        v-for="category in neededCategories"
                        :key="category.shorty"
                        class="flex justify-between px-4 py-3"
                    >
                        <div>{{ category.name }}</div>
                        <Button
                            v-if="category.neededToCreate"
                            size="S"
                            icon="fas fa-plus"
                            color="green"
                            @click="createCategory(category)"
                        >
                            {{ txx('Erstellen') }}
                        </Button>
                        <i v-else class="fas fa-check text-icon-xl text-green-500"></i>
                    </div>
                </div>
            </template>
        </Card>
    </ContentWrapper>
</template>
