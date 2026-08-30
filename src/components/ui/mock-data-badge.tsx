import { Badge } from "./badge";

/**
 * Selo obrigatório sempre que dados de exemplo estão em tela (briefing §83).
 * Nunca deve aparecer perto de dado oficial real do TSE.
 */
export function MockDataBadge({ className }: { className?: string }) {
  return (
    <Badge variant="mock" className={className} title="Estes dados são fictícios, gerados para desenvolvimento — não representam candidatos reais.">
      ● DADOS DE EXEMPLO
    </Badge>
  );
}
