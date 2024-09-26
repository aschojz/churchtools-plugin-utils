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
                        avatar: { icon: 'fas fa-grid-2', color: 'accent' },
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
                        avatar: { icon: 'fas fa-envelope', color: 'accent' },
                        title: txx('E-Mails'),
                        description: txx(
                            'Vorlagen für E-Mails erstellen mit Platzhaltern für die addressierte Person und eine ausgewählte Gruppe.',
                        ),
                        to: { name: 'templates-email' },
                    },
                    {
                        key: 'templates-post',
                        avatar: { icon: 'fas fa-newspaper', color: 'accent' },
                        title: txx('Beiträge'),
                        description: txx(
                            'Vorlagen für Beiträge mit Platzhaltern für eine Person oder/und eine ausgewählte Gruppe.',
                        ),
                        to: { name: 'templates-post' },
                    },
                ],
            },
            {
                key: 'others',
                title: txx('Sonstiges'),
                children: [
                    {
                        key: 'qr-code',
                        avatar: { icon: 'fas fa-qrcode', color: 'accent' },
                        title: txx('QR-Codes generieren'),
                        description: txx('QR-Code für eine URL generieren und runterladen'),
                        to: { name: 'qr-code' },
                    },
                ],
            },
        ];
        return menu;
    });

    return { menu };
}
