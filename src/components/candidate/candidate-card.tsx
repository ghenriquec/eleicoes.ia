import Link from "next/link";
import { UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import type { CandidateCardData } from "@/lib/data/candidates";

const STATUS_TONE: Record<string, "accent" | "danger" | "neutral"> = {
  DEFERIDA: "accent",
  "SUB JUDICE": "danger",
};

export function CandidateCard({ candidate }: { candidate: CandidateCardData }) {
  return (
    <Link
      href={`/candidato/${candidate.slug}`}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 transition-colors hover:border-accent hover:bg-accent-tint"
    >
      <div className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-xl bg-surface-2 text-taupe">
        {candidate.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={candidate.photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <UserRound size={24} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-base font-bold tabular-nums text-accent-ink">{candidate.ballotNumber}</span>
          <span className="truncate font-display text-[15px] font-semibold">{candidate.ballotName}</span>
        </div>
        <p className="mt-0.5 truncate text-[13px] text-text-muted">
          {candidate.office.name} · {candidate.party.acronym} · {candidate.state.uf}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <Badge variant={STATUS_TONE[candidate.status] ?? "neutral"}>{candidate.status}</Badge>
          {candidate.isMockData && <MockDataBadge />}
        </div>
      </div>
    </Link>
  );
}
