import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";
import { useAuth } from "../../auth/AuthContext";
import { Alert, Button, Field, inputClass, PasswordInput } from "../../components/ui";
import { authApi, getErrorMessage } from "../../lib/api";
import { AuthLayout, textLinkClass } from "./AuthLayout";

const DEMO_ACCOUNT = { email: "demo@studytrack.test", password: "demo1234" };

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      authApi.login(credentials.email, credentials.password),
    onSuccess: (data) => signIn(data.token, data.user),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login.mutate({ email, password });
  }

  // akun demo diisi lalu langsung dipakai masuk supaya juri bisa mencoba tanpa mendaftar
  function handleDemoLogin() {
    setEmail(DEMO_ACCOUNT.email);
    setPassword(DEMO_ACCOUNT.password);
    login.mutate(DEMO_ACCOUNT);
  }

  return (
    <AuthLayout
      title="Masuk ke StudyTrack"
      description="Pantau tugas kuliah dan deadline-nya di satu tempat."
      footer={
        <>
          Belum punya akun?{" "}
          <Link to="/register" className={textLinkClass}>
            Daftar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-5">
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
        <Field id="password" label="Password">
          <PasswordInput
            id="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        {login.isError && <Alert>{getErrorMessage(login.error, "Gagal masuk. Coba lagi.")}</Alert>}
        <Button type="submit" disabled={login.isPending} className="w-full">
          {login.isPending ? "Memproses..." : "Masuk"}
        </Button>
      </form>
      <div className="mt-3">
        <Button
          variant="secondary"
          onClick={handleDemoLogin}
          disabled={login.isPending}
          className="w-full"
        >
          Coba akun demo
        </Button>
      </div>
    </AuthLayout>
  );
}
