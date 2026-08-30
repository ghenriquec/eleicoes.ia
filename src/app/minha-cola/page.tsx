import type { Metadata } from "next";
import { BallotBuilder } from "@/components/ballot/ballot-builder";

export const metadata: Metadata = { title: "Minha cola" };

export default function MinhaColaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <BallotBuilder />
    </div>
  );
}
