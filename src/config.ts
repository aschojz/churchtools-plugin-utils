import { CustomModuleDataCategoryCreate } from '@churchtools/utils';
import { txx } from './utils';

export const needed: Omit<CustomModuleDataCategoryCreate, 'customModuleId'>[] = [
    {
        shorty: 'templates-email',
        name: txx('Vorlagen'),
        description: txx('Template mit Placeholdern'),
    },
    {
        shorty: 'templates-post',
        name: txx('Vorlagen für Posts'),
        description: txx('Template mit Placeholdern'),
    },
];
