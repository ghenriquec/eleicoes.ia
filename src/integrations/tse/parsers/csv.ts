/**
 * Parser de CSV do TSE — nunca assume UTF-8 (briefing "ENCODING").
 * Os arquivos `consulta_cand`/`bem_candidato`/etc. são publicados em
 * ISO-8859-1 (latin1), delimitados por `;`, com aspas duplas e quebras de
 * linha CRLF — confirmado por múltiplas fontes independentes (ver
 * docs/tse-integration.md §2). Detecta o delimitador em vez de assumir,
 * como defesa adicional caso o TSE troque para `,` em algum recurso.
 */

export type CsvRow = Record<string, string>;

const CANDIDATE_DELIMITERS = [";", ",", "\t"] as const;

function detectDelimiter(headerLine: string): string {
  let best: string = ";";
  let bestCount = -1;
  for (const d of CANDIDATE_DELIMITERS) {
    const count = headerLine.split(d).length;
    if (count > bestCount) {
      bestCount = count;
      best = d;
    }
  }
  return best;
}

/**
 * Tokeniza o texto inteiro em linhas de células, respeitando aspas — inclui
 * quebra de linha DENTRO de um campo entre aspas (CSV válido, e o TSE usa
 * isso em alguns campos de descrição de bens). Nunca quebrar por `\n`
 * primeiro e só depois olhar aspas: isso corrompe qualquer linha cujo campo
 * tenha uma quebra embutida (achado real ao importar `bem_candidato_2026`).
 */
function tokenizeCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      cells.push(current);
      current = "";
    } else if (char === "\r" || char === "\n") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      cells.push(current);
      current = "";
      if (cells.length > 1 || cells[0] !== "") rows.push(cells); // pula linha em branco
      cells = [];
    } else {
      current += char;
    }
  }
  cells.push(current);
  if (cells.length > 1 || cells[0] !== "") rows.push(cells);

  return rows;
}

export interface ParseCsvOptions {
  /** default: "iso-8859-1" — só troque se o recurso específico confirmadamente publicar UTF-8. */
  encoding?: "iso-8859-1" | "utf-8";
}

export function decodeCsvBuffer(buffer: ArrayBuffer, encoding: ParseCsvOptions["encoding"] = "iso-8859-1"): string {
  return new TextDecoder(encoding).decode(buffer);
}

export function parseCsv(text: string): CsvRow[] {
  const firstLineEnd = text.search(/\r\n|\r|\n/);
  const headerLineRaw = firstLineEnd === -1 ? text : text.slice(0, firstLineEnd);
  const delimiter = detectDelimiter(headerLineRaw);

  const rows = tokenizeCsv(text, delimiter);
  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.trim());

  return rows.slice(1).map((cells) => {
    const row: CsvRow = {};
    headers.forEach((h, i) => {
      row[h] = (cells[i] ?? "").trim();
    });
    return row;
  });
}

export function parseTseCsv(buffer: ArrayBuffer, options: ParseCsvOptions = {}): CsvRow[] {
  const text = decodeCsvBuffer(buffer, options.encoding);
  return parseCsv(text);
}
