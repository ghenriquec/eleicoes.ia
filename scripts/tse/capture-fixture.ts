import "dotenv/config";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Utilitário para capturar uma resposta real do TSE como fixture, de uma
 * rede que tenha acesso (este ambiente de desenvolvimento é bloqueado —
 * ver docs/tse-integration.md). Uso:
 *
 *   npm run tse:capture-fixture -- https://resultados.tse.jus.br/oficial/comum/config/ele-c.json nome-do-arquivo.json
 */
async function main() {
  const [url, outName] = process.argv.slice(2);
  if (!url || !outName) {
    console.error("Uso: npm run tse:capture-fixture -- <url> <nome-do-arquivo.json>");
    process.exit(1);
  }

  const res = await fetch(url, { headers: { "User-Agent": "votocerto.ia-fixture-capture/1.0" } });
  if (!res.ok) {
    console.error(`HTTP ${res.status} ao buscar ${url}`);
    process.exit(1);
  }
  const data = await res.json();

  const dir = join(process.cwd(), "src/integrations/tse/fixtures", `captured-${new Date().toISOString().slice(0, 10)}`);
  mkdirSync(dir, { recursive: true });
  const outPath = join(dir, outName);
  writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`Salvo em ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
