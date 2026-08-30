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

function splitCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

export interface ParseCsvOptions {
  /** default: "iso-8859-1" — só troque se o recurso específico confirmadamente publicar UTF-8. */
  encoding?: "iso-8859-1" | "utf-8";
}

export function decodeCsvBuffer(buffer: ArrayBuffer, encoding: ParseCsvOptions["encoding"] = "iso-8859-1"): string {
  return new TextDecoder(encoding).decode(buffer);
}

export function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r\n|\r|\n/).filter((l) => l.length > 0);
  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitCsvLine(lines[0], delimiter).map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line, delimiter);
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
