/**
 * Ícones de marca (G1/UOL/CNN/BBC) são logotipos tipográficos, não glifos
 * pictóricos como Instagram/Facebook — reproduzir o desenho exato de cada
 * wordmark de memória arriscaria ficar errado. Em vez disso, cada fonte
 * ganha um selo com a sigla, cor própria só o suficiente pra distinguir
 * rápido no feed, sem fingir ser o logotipo oficial.
 */
const SOURCE_STYLE: Record<string, { label: string; className: string }> = {
  g1: { label: "G1", className: "bg-[#e30613] text-white" },
  uol: { label: "UOL", className: "bg-[#1c2ee3] text-white" },
  "cnn-brasil": { label: "CNN", className: "bg-[#cc0000] text-white" },
  "bbc-brasil": { label: "BBC", className: "bg-[#17191c] text-white" },
};

export function SourceIcon({ sourceId, className }: { sourceId: string; className?: string }) {
  const style = SOURCE_STYLE[sourceId];
  if (!style) return null;
  return (
    <span
      className={`inline-flex h-4 items-center justify-center rounded px-1 font-mono text-[9px] font-bold leading-none tracking-tight ${style.className} ${className ?? ""}`}
    >
      {style.label}
    </span>
  );
}
