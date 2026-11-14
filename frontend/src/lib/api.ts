import axios, { isAxiosError } from "axios";
import type { AuthResponse, Course, Task, TaskStatus, User } from "./types";

export const TOKEN_KEY = "studytrack_token";
export const UNAUTHORIZED_EVENT = "studytrack:unauthorized";

// path relatif /api diteruskan oleh proxy vite saat lokal dan rewrite vercel saat production
const http = axios.create({ baseURL: "/api" });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// token yang ditolak backend dihapus lalu auth provider diberi tahu lewat event
http.interceptors.response.use(undefined, (error: unknown) => {
  if (isAxiosError(error) && error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  throw error;
});

// pesan error dari backend selalu berformat { error }, selain itu pakai pesan cadangan
export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error ?? fallback;
  }
  return fallback;
}

export interface TaskInput {
  mata_kuliah_id: number;
  judul: string;
  deskripsi: string;
  deadline: string;
}

export interface CourseInput {
  name: string;
  kode: string;
  dosen: string;
}

export interface RegisterInput {
  nama: string;
  email: string;
  password: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await http.post<AuthResponse>("/auth/login", { email, password });
    return data;
  },
  register: async (input: RegisterInput): Promise<AuthResponse> => {
    const { data } = await http.post<AuthResponse>("/auth/register", input);
    return data;
  },
  me: async (): Promise<User> => {
    const { data } = await http.get<{ user: User }>("/auth/me");
    return data.user;
  },
};

export const taskApi = {
  list: async (): Promise<Task[]> => {
    const { data } = await http.get<{ tasks: Task[] }>("/tasks");
    return data.tasks;
  },
  create: async (input: TaskInput): Promise<void> => {
    await http.post("/tasks", input);
  },
  setStatus: async (id: number, status: TaskStatus): Promise<void> => {
    await http.put(`/tasks/${id}`, { status });
  },
  remove: async (id: number): Promise<void> => {
    await http.delete(`/tasks/${id}`);
  },
};

export const courseApi = {
  list: async (): Promise<Course[]> => {
    const { data } = await http.get<{ courses: Course[] }>("/courses");
    return data.courses;
  },
  create: async (input: CourseInput): Promise<void> => {
    await http.post("/courses", input);
  },
  remove: async (id: number): Promise<void> => {
    await http.delete(`/courses/${id}`);
  },
};
