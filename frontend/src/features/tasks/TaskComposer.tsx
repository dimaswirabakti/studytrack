import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Link } from "react-router";
import { Alert, Button, Field, inputClass } from "../../components/ui";
import { getErrorMessage } from "../../lib/api";
import type { Course } from "../../lib/types";
import { useCreateTask } from "./useTasks";

interface TaskComposerProps {
  id: string;
  courses: Course[];
  onClose: () => void;
}

const panelClass =
  "mt-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-900/5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900";

export function TaskComposer({ id, courses, onClose }: TaskComposerProps) {
  const createTask = useCreateTask();
  const titleRef = useRef<HTMLInputElement>(null);
  const [courseId, setCourseId] = useState("");
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createTask.mutate(
      { mata_kuliah_id: Number(courseId), judul, deskripsi, deadline },
      { onSuccess: onClose },
    );
  }

  // escape menutup panel tanpa harus mencari tombol batal
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      onClose();
    }
  }

  if (courses.length === 0) {
    return (
      <section id={id} className={panelClass} onKeyDown={handleKeyDown}>
        <p className="font-medium">Belum ada mata kuliah</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Setiap tugas menempel ke satu mata kuliah. Tambahkan mata kuliah dulu, lalu kembali ke
          sini.
        </p>
        <Link
          to="/courses"
          className="mt-4 inline-flex h-10 items-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-zinc-50 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Tambah mata kuliah
        </Link>
      </section>
    );
  }

  return (
    <section id={id} aria-label="Tambah tugas baru" className={panelClass}>
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field id="task-title" label="Judul tugas">
            <input
              ref={titleRef}
              id="task-title"
              required
              value={judul}
              onChange={(event) => setJudul(event.target.value)}
              className={`${inputClass} h-10`}
            />
          </Field>
        </div>
        <Field id="task-course" label="Mata kuliah">
          <select
            id="task-course"
            required
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
            className={`${inputClass} h-10`}
          >
            <option value="" disabled>
              Pilih mata kuliah
            </option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.kode ? `${course.kode} ${course.name}` : course.name}
              </option>
            ))}
          </select>
        </Field>
        <Field id="task-deadline" label="Deadline">
          <input
            id="task-deadline"
            type="datetime-local"
            required
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            className={`${inputClass} h-10`}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field id="task-description" label="Deskripsi" optional>
            <textarea
              id="task-description"
              rows={3}
              value={deskripsi}
              onChange={(event) => setDeskripsi(event.target.value)}
              className={`${inputClass} py-2`}
            />
          </Field>
        </div>
        {createTask.isError && (
          <div className="sm:col-span-2">
            <Alert>{getErrorMessage(createTask.error, "Tugas gagal disimpan. Coba lagi.")}</Alert>
          </div>
        )}
        <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={createTask.isPending}>
            {createTask.isPending ? "Menyimpan..." : "Simpan tugas"}
          </Button>
        </div>
      </form>
    </section>
  );
}
