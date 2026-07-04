export default function DatabaseDemoPage() {
  return (
    <main className="container-page py-12">
      <div className="card p-6">
        <h1 className="text-3xl">Database Demo</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Route ini kini digunakan sebagai placeholder setelah migrasi ke Neon DB.
        </p>
        <p className="mt-4 text-sm text-neutral-600">
          Koneksi database utama sudah diarahkan ke Neon PostgreSQL melalui variabel environment.
        </p>
      </div>
    </main>
  );
}
