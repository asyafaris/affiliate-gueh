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
    <main className="grid min-h-screen place-items-center bg-paper px-4">
      <form action={onSubmit} className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="eyebrow">Admin CMS</p>
        <h1 className="mt-2 font-serif text-3xl font-bold">Masuk ke dashboard</h1>
        <div className="mt-6 grid gap-4">
          <input name="email" type="email" required placeholder="Email" className="rounded-md border border-line px-4 py-3 outline-none focus:border-moss" />
          <input name="password" type="password" required placeholder="Password" className="rounded-md border border-line px-4 py-3 outline-none focus:border-moss" />
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
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
