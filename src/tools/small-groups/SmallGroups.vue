<script setup lang="ts">
import { churchtoolsClient } from '@churchtools/churchtools-client';
import {
    DomainObjectPerson,
    Group,
    GroupPlace,
    Person,
    queryClient,
    usePersonsQueryAllPages,
} from '@churchtools/utils';
import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

const HAUSKREIS_HOMEPAGE = '1zc2v2QVqZ3GJcI0iEgiSBMLyG12QkHf';
const { data } = useQuery(
    {
        queryKey: ['grouphomepage', HAUSKREIS_HOMEPAGE],
        queryFn: () => churchtoolsClient.get<{ groups: Group[] }>(`/grouphomepages/${HAUSKREIS_HOMEPAGE}`),
    },
    queryClient,
);
const leaderIds = computed(() => {
    return { ids: data.value?.groups.flatMap(hk => hk.information.leader.map(l => l.domainIdentifier)) };
});

const { data: leadersRaw } = usePersonsQueryAllPages(leaderIds);
const personMap = computed(() => {
    return (leadersRaw.value ?? []).reduce(
        (acc, person) => {
            acc[person.id] = person;
            return acc;
        },
        {} as Record<string, Person>,
    );
});

const transformedGroups = computed(() => {
    return (
        (data.value?.groups ?? []) as (Group & {
            information: { leader: DomainObjectPerson[]; groupPlaces: GroupPlace[] };
        })[]
    )
        .filter(hk => ![1882].includes(hk.id))
        .map(hk => {
            const leaders: Record<string, (Partial<Person> & { phone: string; title: string })[]> = {};
            hk.information.leader.forEach(l => {
                const person = personMap.value[l.domainIdentifier];
                if (!person) {
                    leaders[l.domainIdentifier] = [{ title: l.title, phone: '' }];
                } else {
                    const phone = (person.phonePrivate || person.phoneWork || person.mobile || '')
                        ?.replace(/[^0-9+]/g, ' ')
                        .trim();
                    if (!leaders[phone || l.domainIdentifier]) {
                        leaders[phone || l.domainIdentifier] = [{ ...person, phone, title: l.title }];
                    } else {
                        leaders[phone || l.domainIdentifier].push({ ...person, phone, title: l.title });
                    }
                }
            });

            const places = new Set(hk.information.groupPlaces?.map(p => p.district || p.city || p.name));
            return {
                ...hk,
                leader: Object.values(leaders),
                places: format(Array.from(places)),
            };
        });
});
const formatter = new Intl.ListFormat('de', { style: 'long', type: 'conjunction' });
const format = (value: string[]) => formatter.format(value).replace(' und ', ' & ');
const showMissing = true;
</script>
<template>
    <div class="hk-grid">
        <div
            v-for="hk in transformedGroups"
            :key="hk.id"
            class="card border-basic-interactive text-body-m flex flex-col gap-0.5 rounded border border-solid bg-white px-4 py-2"
        >
            <div class="font-bold text-balance break-words">{{ hk.name }}</div>
            <div v-if="showMissing || hk.leader.length" class="flex items-baseline gap-2">
                <i
                    class="fas fa-fw fa-user-friends shrink-0"
                    :class="hk.leader.length ? 'text-basic-bright' : 'text-red-bright'"
                ></i>
                <div>
                    {{
                        format(
                            hk.leader.map(l => {
                                return `${l.map(p => p.firstName).join(' + ')} ${l[0].lastName} ${l[0].phone ? `(${l[0].phone})` : ''}`;
                            }),
                        )
                    }}
                </div>
            </div>
            <div v-if="showMissing || hk.places.length" class="flex items-baseline gap-2">
                <i
                    class="fas fa-fw fa-map-marker-alt shrink-0"
                    :class="hk.places.length ? 'text-basic-bright' : 'text-red-bright'"
                ></i>
                <div>{{ hk.places }}</div>
            </div>
            <div
                v-if="showMissing || (hk.information.weekday && hk.information.meetingTime)"
                class="flex items-baseline gap-2"
            >
                <i
                    class="fas fa-fw fa-calendar-day shrink-0"
                    :class="
                        hk.information.weekday && hk.information.meetingTime ? 'text-basic-bright' : 'text-red-bright'
                    "
                ></i>
                <div v-if="hk.information.weekday && hk.information.meetingTime" class="flex gap-1">
                    <div v-if="hk.information.weekday">{{ hk.information.weekday.nameTranslated }}</div>
                    ·
                    <div v-if="hk.information.meetingTime">{{ hk.information.meetingTime.replace(' Uhr', '') }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
.hk-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    padding: 1rem;
}
@media print {
    .navbar,
    #c-grid__left,
    #c-grid__header {
        display: none;
    }
    .card {
        page-break-inside: avoid;
    }
}
</style>
