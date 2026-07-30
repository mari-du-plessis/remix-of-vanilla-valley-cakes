import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const adminRoleKey = (userId?: string) => ["is-admin", userId ?? "anon"] as const;

/** Server-verified admin check (RLS-scoped read of user_roles). */
export function useIsAdmin(userId: string | undefined) {
  return useQuery({
    queryKey: adminRoleKey(userId),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId!)
        .eq("role", "admin");
      if (error) throw error;
      return (data?.length ?? 0) > 0;
    },
  });
}
