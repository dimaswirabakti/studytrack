import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "../../lib/api";
import type { TaskStatus } from "../../lib/types";

export const TASKS_KEY = ["tasks"] as const;

export function useTasks() {
  return useQuery({ queryKey: TASKS_KEY, queryFn: taskApi.list });
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
