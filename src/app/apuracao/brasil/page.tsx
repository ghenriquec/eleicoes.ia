import type { Metadata } from "next";
import { LiveResults } from "@/components/results/live-results";
import { ElectionOffice } from "@/integrations/tse/constants/offices";

export const metadata: Metadata = { title: "Apuração — Brasil" };
export const dynamic = "force-dynamic";

export default function ApuracaoBrasilPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Presidente — Brasil</h1>
      <div className="mt-8">
        <LiveResults round={1} scope="BR" office={ElectionOffice.PRESIDENT} label="Presidente" />
      </div>
    </div>
  );
}
