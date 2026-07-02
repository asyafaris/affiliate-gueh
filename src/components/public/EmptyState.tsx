export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-8 text-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-ink/65">{description}</p>
    </div>
  );
}
