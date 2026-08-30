export function LegalPage({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      {subtitle && <p className="mt-2 text-text-muted">{subtitle}</p>}
      <div className="prose-legal mt-8 flex flex-col gap-5 text-[15px] leading-relaxed text-text [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1.5 [&_a]:text-accent-ink [&_a]:underline">
        {children}
      </div>
    </div>
  );
}
