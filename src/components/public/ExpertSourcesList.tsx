import { ExternalLink, Youtube, BookOpen, MessageCircle } from "lucide-react";

type Source = {
  sourceType: string;
  sourceName: string;
  sourceUrl: string;
  sourceAuthorFollowers: number | null;
  quote: string | null;
};

type Props = {
  sources: Source[];
};

function getIcon(type: string) {
  switch (type) {
    case "YOUTUBE":
      return <Youtube className="h-4 w-4" />;
    case "BLOG":
      return <BookOpen className="h-4 w-4" />;
    case "FORUM":
      return <MessageCircle className="h-4 w-4" />;
    default:
      return <ExternalLink className="h-4 w-4" />;
  }
}

export function ExpertSourcesList({ sources }: Props) {
  if (sources.length === 0) return null;

  return (
    <div className="grid gap-3">
      <p className="text-sm font-semibold text-ink/75">Dikonfirmasi oleh expert sumber:</p>
      {sources.map((source, idx) => (
        <a
          key={idx}
          href={source.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 rounded-lg border border-line bg-paper p-3 transition hover:border-moss hover:bg-white"
        >
          <div className="mt-0.5 text-moss">{getIcon(source.sourceType)}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <span>{source.sourceName}</span>
              {source.sourceAuthorFollowers && (
                <span className="text-xs text-ink/60">({(source.sourceAuthorFollowers / 1000).toFixed(0)}k followers)</span>
              )}
            </div>
            {source.quote && <p className="mt-1 text-sm italic text-ink/70">&quot;{source.quote}&quot;</p>}
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-moss hover:underline">
              Lihat sumber <ExternalLink className="h-3 w-3" />
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
