import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createUser, fetchUsers, type User } from "@/services/users";

export const usersKey = ["users"] as const;

export function useUsers() {
  return useQuery({ queryKey: usersKey, queryFn: fetchUsers });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: async (created) => {
      // Server returns the created user — prepend into the cache, no refetch needed.
      // cancelQueries first so an in-flight GET can't resolve late and clobber it.
      await queryClient.cancelQueries({ queryKey: usersKey });
      queryClient.setQueryData<User[]>(usersKey, (prev = []) => [created, ...prev]);
    },
  });
}
