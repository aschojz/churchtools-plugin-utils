import { DomainObjectPerson, useDate, usePersonsQuery } from '@churchtools/utils';
import { computed, Ref, ref } from 'vue';
import { txx } from '../utils';

export function usePlaceholderPerson(hasPlaceholder: Ref<boolean>) {
    const { distanceToNowStrict } = useDate();
    const personDO = ref<DomainObjectPerson | null>();
    const personQuery = computed(() => ({
        ids: personDO.value?.domainIdentifier ? [parseInt(personDO.value?.domainIdentifier)] : undefined,
    }));

    const { data } = usePersonsQuery(personQuery, { enabled: () => !!personDO.value });
    const person = computed(() => {
        const person = data.value?.pages[0].persons[0];
        if (!person) return undefined;
        const birthday = new Date(person?.birthday);
        return {
            ...person,
            name: `${person?.firstName} ${person?.lastName}`,
            age: person?.birthday ? distanceToNowStrict(birthday, { unit: 'year' }) : txx('Geburtstag unbekannt'),
        };
    });
    const personError = computed(() => {
        if (hasPlaceholder.value && !personDO.value) {
            return { message: txx('Person ist nicht ausgewählt'), date: new Date() };
        }
        return undefined;
    });

    const personPlaceholder = computed(() => {
        return [
            { id: 'person.firstName', label: txx('Vorname') },
            { id: 'person.lastName', label: txx('Nachname') },
            { id: 'person.name', label: txx('Vor- & Nachname') },
            { id: 'person.age', label: txx('Alter') },
        ];
    });
    return { person, personDO, personError, personPlaceholder };
}
