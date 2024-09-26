import { DomainObjectPerson, useDate, usePersonsQueryAllPages } from '@churchtools/utils';
import { computed, Ref } from 'vue';
import { txx } from '../utils';

export function usePlaceholderPerson(personsDO: Ref<DomainObjectPerson[]>, hasPlaceholder: Ref<boolean>) {
    const { distanceToNowStrict } = useDate();

    const personQuery = computed(() => ({
        ids: personsDO.value
            .filter(p => p.domainIdentifier)
            .map(p => p.domainIdentifier && parseInt(p.domainIdentifier)),
    }));

    const { data } = usePersonsQueryAllPages(personQuery, { enabled: () => !!personsDO.value.length });
    const persons = computed(() => {
        const persons = data.value;
        if (!persons) {
            return undefined;
        }
        return persons.map(person => {
            const birthday = new Date(person?.birthday);
            return {
                ...person,
                name: `${person?.firstName} ${person?.lastName}`,
                age: person?.birthday ? distanceToNowStrict(birthday, { unit: 'year' }) : txx('Geburtstag unbekannt'),
            };
        });
    });
    const personError = computed(() => {
        if (hasPlaceholder.value && !personsDO.value.length) {
            return { message: txx('Person ist nicht ausgewählt'), date: new Date() };
        }
        return undefined;
    });

    const personPlaceholder = computed(() => {
        return [
            { id: 'person.0.firstName', label: txx('Vorname') },
            { id: 'person.0.lastName', label: txx('Nachname') },
            { id: 'person.0.name', label: txx('Vor- & Nachname') },
            { id: 'person.0.age', label: txx('Alter') },
        ];
    });
    return { persons, personError, personPlaceholder };
}
