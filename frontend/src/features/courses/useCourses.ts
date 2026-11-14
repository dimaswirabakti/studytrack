import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { courseApi } from "../../lib/api";
import { TASKS_KEY } from "../tasks/useTasks";

export const COURSES_KEY = ["courses"] as const;

export function useCourses() {
  return useQuery({ queryKey: COURSES_KEY, queryFn: courseApi.list });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courseApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COURSES_KEY }),
  });
}

// menghapus mata kuliah juga menghapus tugasnya sehingga cache tugas ikut disegarkan
export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courseApi.remove,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: COURSES_KEY }),
        queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
      ]),
  });
}
