import { MenuItemV2 } from '@churchtools/styleguide';
import { computed } from 'vue';
import { txx } from '../utils';

export default function useMenu() {
    const menu = computed(() => {
        const menu: MenuItemV2[] = [
            {
                key: 'overview',
                children: [
                    {
                        key: 'overview-utils',
                        avatar: { icon: 'fas fa-grid-2' },
                        title: txx('Übersicht'),
                        to: { name: 'overview' },
                    },
                ],
            },
            {
                key: 'templates',
                title: txx('Vorlagen'),
                children: [
                    {
                        key: 'templates-email',
                        avatar: { icon: 'fas fa-envelope' },
                        title: txx('E-Mails'),
                        description: txx(
                            'Vorlagen für E-Mails erstellen mit Platzhaltern für die addressierte Person und eine ausgewählte Gruppe.',
                        ),
                        to: { name: 'templates-email' },
                    },
                ],
            },
        ];
        return menu;
    });

    return { menu };
}
