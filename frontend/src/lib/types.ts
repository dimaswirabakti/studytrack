// bentuk data yang dikirim backend, disamakan dengan tipe di repository backend

export type TaskStatus = "belum" | "selesai";

// kategori dihitung backend berdasarkan sisa waktu ke deadline
export type TaskCategory = "mendekati_deadline" | "terlambat" | "normal" | "selesai";

export interface User {
  id: number;
  nama: string;
  email: string;
}

export interface Course {
  id: number;
  user_id: number;
  name: string;
  kode: string;
  dosen: string;
}

export interface Task {
  id: number;
  user_id: number;
  mata_kuliah_id: number;
  judul: string;
  deskripsi: string;
  deadline: string;
  status: TaskStatus;
  created_at: string;
  mata_kuliah: string;
  kategori: TaskCategory;
  // selisih deadline dengan waktu server saat respons dibuat, negatif jika sudah lewat
  sisa_ms: number;
}

export interface TaskList {
  tasks: Task[];
  server_time: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface StudyPlanStep {
  judul: string;
  durasi_menit: number;
}

export interface StudyPlan {
  ringkasan: string;
  langkah: StudyPlanStep[];
  saran: string;
}

export interface SavedPlan {
  plan: StudyPlan;
  model: string;
  created_at: string;
}

export interface PlanStatus {
  plan: SavedPlan | null;
  // false jika server belum dikonfigurasi dengan api key gemini
  enabled: boolean;
}
