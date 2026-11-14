import { useState } from "react";
import type { FormEvent } from "react";
import { ConfirmDeleteButton } from "../../components/ConfirmDeleteButton";
import { Alert, Button, Field, inputClass } from "../../components/ui";
import { getErrorMessage } from "../../lib/api";
import type { Course } from "../../lib/types";
import { useCourses, useCreateCourse, useDeleteCourse } from "./useCourses";

function CourseForm() {
  const createCourse = useCreateCourse();
  const [name, setName] = useState("");
  const [kode, setKode] = useState("");
  const [dosen, setDosen] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createCourse.mutate(
      { name, kode, dosen },
      {
        onSuccess: () => {
          setName("");
          setKode("");
          setDosen("");
        },
      },
    );
  }

  return (
    <section aria-labelledby="course-form-title" className="lg:sticky lg:top-24 lg:self-start">
      <h2 id="course-form-title" className="font-semibold">
        Tambah mata kuliah
      </h2>
      <form onSubmit={handleSubmit} className="mt-5 grid gap-5">
        <Field id="course-name" label="Nama mata kuliah">
          <input
            id="course-name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={`${inputClass} h-10`}
          />
        </Field>
        <Field id="course-code" label="Kode" optional hint="Contoh CS 186">
          <input
            id="course-code"
            aria-describedby="course-code-hint"
            value={kode}
            onChange={(event) => setKode(event.target.value)}
            className={`${inputClass} h-10 font-mono`}
          />
        </Field>
        <Field id="course-lecturer" label="Dosen pengampu" optional>
          <input
            id="course-lecturer"
            value={dosen}
            onChange={(event) => setDosen(event.target.value)}
            className={`${inputClass} h-10`}
          />
        </Field>
        {createCourse.isError && (
          <Alert>{getErrorMessage(createCourse.error, "Mata kuliah gagal disimpan.")}</Alert>
        )}
        <Button type="submit" disabled={createCourse.isPending} className="w-full sm:w-fit">
          {createCourse.isPending ? "Menyimpan..." : "Simpan mata kuliah"}
        </Button>
      </form>
    </section>
  );
}

function CourseRow({ course }: { course: Course }) {
  const deleteCourse = useDeleteCourse();
  return (
    <li className="flex items-start gap-4 py-4">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {course.kode && (
            <span className="rounded-md bg-zinc-200/70 px-1.5 py-0.5 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {course.kode}
            </span>
          )}
          <span className="font-medium">{course.name}</span>
        </p>
        {course.dosen && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{course.dosen}</p>
        )}
        {deleteCourse.isError && (
          <p role="alert" className="mt-1 text-sm text-red-700 dark:text-red-300">
            Mata kuliah gagal dihapus. Coba lagi.
          </p>
        )}
      </div>
      <ConfirmDeleteButton
        label={`Hapus mata kuliah ${course.name}`}
        confirmHint="Semua tugas di mata kuliah ini ikut terhapus"
        disabled={deleteCourse.isPending}
        onConfirm={() => deleteCourse.mutate(course.id)}
      />
    </li>
  );
}

export default function CoursesPage() {
  const coursesQuery = useCourses();
  const courses = coursesQuery.data ?? [];

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Mata kuliah</h1>
      {coursesQuery.isSuccess && (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {courses.length} mata kuliah terdaftar
        </p>
      )}
      <div className="mt-12 grid gap-12 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-16">
        <CourseForm />
        <section aria-label="Daftar mata kuliah">
          {coursesQuery.isPending && (
            <div aria-busy="true" className="grid gap-4">
              <span className="sr-only">Memuat mata kuliah</span>
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="h-12 rounded-lg bg-zinc-200 motion-safe:animate-pulse dark:bg-zinc-800"
                />
              ))}
            </div>
          )}
          {coursesQuery.isError && <Alert>Daftar mata kuliah gagal dimuat.</Alert>}
          {coursesQuery.isSuccess && courses.length === 0 && (
            <p className="border-t border-zinc-300 pt-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              Belum ada mata kuliah. Isi form untuk menambahkan yang pertama.
            </p>
          )}
          {courses.length > 0 && (
            <ul className="divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {courses.map((course) => (
                <CourseRow key={course.id} course={course} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
