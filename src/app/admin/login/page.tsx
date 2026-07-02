"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false
    });
    setLoading(false);
    if (result?.error) {
      setError("Email atau password tidak cocok.");
      return;
    }
    router.push(searchParams.get("callbackUrl") ?? "/admin");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-chrome px-4">
      <form action={onSubmit} className="card w-full max-w-md p-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-sm font-bold text-white">w</span>
          <span className="text-sm font-bold text-primary">worthgoods Admin</span>
        </div>
        <h1 className="mt-2 text-3xl">Masuk ke dashboard</h1>
        <div className="mt-6 grid gap-4">
          <input name="email" type="email" required placeholder="Email" className="field-input" />
          <input name="password" type="password" required placeholder="Password" className="field-input" />
          {error ? <p className="rounded-control bg-red-50 p-3 text-sm text-error">{error}</p> : null}
          <button className="btn-primary" disabled={loading}>{loading ? "Memeriksa..." : "Login"}</button>
        </div>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
