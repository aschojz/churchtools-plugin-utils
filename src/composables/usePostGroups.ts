import { churchtoolsClient } from '@churchtools/churchtools-client';
import { PossiblePostGroup, postQueryKeys, queryClient, useMain } from '@churchtools/utils';
import { useQuery } from '@tanstack/vue-query';

export function usePostGroups() {
    const { isLoggedIn } = useMain();
    return useQuery(
        {
            queryKey: postQueryKeys.metaGroupsToPostIn(),
            queryFn: () => churchtoolsClient.get<PossiblePostGroup[]>('/post/groups'),
            enabled: isLoggedIn,
        },
        queryClient,
    );
}
