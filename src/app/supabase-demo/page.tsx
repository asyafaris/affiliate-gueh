import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

type TodoRow = {
  id: string | number;
  name: string;
};

export default async function SupabaseDemoPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: todos, error } = await supabase.from("todos").select("id, name");

  return (
    <main className="container-page py-12">
      <div className="card p-6">
        <h1 className="text-3xl">Supabase Demo</h1>
        <p className="mt-2 text-sm text-neutral-500">Route ini hanya untuk ngetes koneksi ke tabel <code>todos</code>.</p>
        {error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Gagal mengambil data dari Supabase: {error.message}
          </p>
        ) : (
          <ul className="mt-4 grid gap-2">
            {(todos as TodoRow[] | null)?.map((todo) => (
              <li key={todo.id} className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-primary">
                {todo.name}
              </li>
            ))}
            {!todos?.length ? (
              <li className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500">
                Belum ada data di tabel todos.
              </li>
            ) : null}
          </ul>
        )}
      </div>
    </main>
  );
}
