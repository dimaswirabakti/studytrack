import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { planApi } from "../../lib/api";
import type { PlanStatus } from "../../lib/types";

const planKey = (taskId: number) => ["plan", taskId] as const;

// rencana tersimpan baru diambil saat panel dibuka supaya halaman daftar tetap ringan
export function useTaskPlan(taskId: number, enabled: boolean) {
  return useQuery({
    queryKey: planKey(taskId),
    queryFn: () => planApi.get(taskId),
    enabled,
    staleTime: Infinity,
  });
}

export function useGeneratePlan(taskId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => planApi.generate(taskId),
    onSuccess: (plan) =>
      queryClient.setQueryData<PlanStatus>(planKey(taskId), { plan, enabled: true }),
  });
}
