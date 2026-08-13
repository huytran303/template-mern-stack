import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createUser, fetchUsers } from "@/services/users";

// Root key for cross-cutting cache ops (invalidate/cancel match by prefix);
// usersKey(search) identifies one filtered list — every queryFn input is part of the key.
export const usersKeyRoot = ["users"] as const;
export function usersKey(search: string) {
  return [...usersKeyRoot, search] as const;
}

export function useUsers(search = "") {
  return useQuery({
    queryKey: usersKey(search),
    queryFn: ({ signal }) => fetchUsers({ search, signal }),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      // The list is server-filtered now — the response alone can't tell whether the new
      // user matches the active search, so refetch instead of setQueryData.
      await queryClient.invalidateQueries({ queryKey: usersKeyRoot });
    },
  });
}
