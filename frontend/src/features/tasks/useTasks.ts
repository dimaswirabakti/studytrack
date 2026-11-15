import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "../../lib/api";
import type { TaskStatus } from "../../lib/types";

export const TASKS_KEY = ["tasks"] as const;

// kategori bergeser seiring waktu sehingga daftar diambil ulang setiap menit dan saat tab kembali aktif
const REFRESH_INTERVAL_MS = 60_000;

export function useTasks() {
  return useQuery({
    queryKey: TASKS_KEY,
    queryFn: taskApi.list,
    refetchInterval: REFRESH_INTERVAL_MS,
  });
}

function useInvalidateTasks() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: TASKS_KEY });
}

export function useCreateTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({ mutationFn: taskApi.create, onSuccess: invalidate });
}

export function useSetTaskStatus() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: TaskStatus }) =>
      taskApi.setStatus(id, status),
    onSuccess: invalidate,
  });
}

export function useDeleteTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({ mutationFn: taskApi.remove, onSuccess: invalidate });
}
