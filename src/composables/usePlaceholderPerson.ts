import {
    DomainObjectPerson,
    formatDistanceToNowStrict,
    notNullish,
    t,
    useDbFieldsQuery,
    usePersonsQueryAllPages,
} from '@churchtools/utils';
import { computed, Ref } from 'vue';
import { txx } from '../utils';

export function usePlaceholderPerson(personsDO: Ref<DomainObjectPerson[]>, personCount: Ref<number>) {
    const personQuery = computed(() => ({
        ids: personsDO.value.map(p => p.domainIdentifier && parseInt(p.domainIdentifier)).filter(notNullish),
    }));

    const { data } = usePersonsQueryAllPages(personQuery, { enabled: () => !!personsDO.value.length });
    const persons = computed(() => {
        const persons = data.value;
        if (!persons) {
            return undefined;
        }
        return persons.map(person => {
            const birthday = person?.birthday ? new Date(person?.birthday) : undefined;
            return {
                ...person,
                name: `${person?.firstName} ${person?.lastName}`,
                age: birthday ? formatDistanceToNowStrict(birthday, { unit: 'year' }) : txx('Geburtstag unbekannt'),
            };
        });
    });
    const personError = computed(() => {
        const missingPerson = personCount.value - personsDO.value.length;
        if (missingPerson > 0) {
            return { message: txx(`Es fehlen noch Personen: ${missingPerson}`), date: new Date() };
        }
        return undefined;
    });

    const { addressFields, churchFields, categoryFields, datasecurityFields } = useDbFieldsQuery();
    const personPlaceholder = computed(() => {
        return [
            { id: 'person.0.name', label: txx('Vor- & Nachname') },
            { id: 'person.0.age', label: txx('Alter') },
            ...[
                ...addressFields.value,
                ...churchFields.value,
                ...categoryFields.value,
                ...datasecurityFields.value,
            ].map(field => ({ id: `person.0.${field.key}`, label: t(field.name, false) })),
        ];
    });
    return { persons, personError, personPlaceholder };
}
