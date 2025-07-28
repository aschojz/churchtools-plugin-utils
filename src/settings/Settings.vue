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
    <ContentWrapper icon="fas fa-cog" max-width :title="txx('Einstellungen')">
        <Card>
            <template #full>
                <div class="divide-basic-divider flex flex-col divide-y divide-solid">
                    <div
                        v-for="category in neededCategories"
                        :key="category.shorty"
                        class="flex justify-between px-4 py-3"
                    >
                        <div>{{ category.name }}</div>
                        <Button
                            v-if="category.neededToCreate"
                            color="green"
                            icon="fas fa-plus"
                            size="S"
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
