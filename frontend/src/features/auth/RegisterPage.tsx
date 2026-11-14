import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";
import { useAuth } from "../../auth/AuthContext";
import { Alert, Button, Field, inputClass, PasswordInput } from "../../components/ui";
import { authApi, getErrorMessage } from "../../lib/api";
import { AuthLayout, textLinkClass } from "./AuthLayout";

export default function RegisterPage() {
  const { signIn } = useAuth();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => signIn(data.token, data.user),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    register.mutate({ nama, email, password });
  }

  return (
    <AuthLayout
      title="Buat akun"
      description="Satu akun untuk semua mata kuliah dan tugasmu."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link to="/login" className={textLinkClass}>
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-5">
        <Field id="nama" label="Nama">
          <input
            id="nama"
            autoComplete="name"
            required
            value={nama}
            onChange={(event) => setNama(event.target.value)}
            className={`${inputClass} h-10`}
          />
        </Field>
        <Field id="email" label="Email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={`${inputClass} h-10`}
          />
        </Field>
        <Field id="password" label="Password" hint="Minimal 6 karakter.">
          <PasswordInput
            id="password"
            autoComplete="new-password"
            required
            minLength={6}
            aria-describedby="password-hint"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        {register.isError && (
          <Alert>{getErrorMessage(register.error, "Gagal mendaftar. Coba lagi.")}</Alert>
        )}
        <Button type="submit" disabled={register.isPending} className="w-full">
          {register.isPending ? "Memproses..." : "Buat akun"}
        </Button>
      </form>
    </AuthLayout>
  );
}
