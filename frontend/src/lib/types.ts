// bentuk data yang dikirim backend, disamakan dengan tipe di repository backend

export type TaskStatus = "belum" | "selesai";

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
}

export interface AuthResponse {
  token: string;
  user: User;
}
