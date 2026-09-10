import { describe, it, expect } from "vitest";
import { parseCsv, decodeCsvBuffer, parseTseCsv } from "./csv";

describe("parseCsv", () => {
  it("faz parse de um CSV simples separado por ponto e vírgula", () => {
    const rows = parseCsv("SQ_CANDIDATO;NM_URNA_CANDIDATO\n123;FULANO");
    expect(rows).toEqual([{ SQ_CANDIDATO: "123", NM_URNA_CANDIDATO: "FULANO" }]);
  });

  it("detecta o delimitador em vez de assumir ';' (briefing 'ENCODING')", () => {
    const rows = parseCsv("a,b,c\n1,2,3");
    expect(rows).toEqual([{ a: "1", b: "2", c: "3" }]);
  });

  it("respeita aspas com delimitador embutido", () => {
    const rows = parseCsv('NOME;PARTIDO\n"SILVA, JOAO";"PT - Federação"');
    expect(rows).toEqual([{ NOME: "SILVA, JOAO", PARTIDO: "PT - Federação" }]);
  });

  it("lida com aspas duplicadas dentro de um campo entre aspas", () => {
    const rows = parseCsv('A\n"ele disse ""oi"""');
    expect(rows[0].A).toBe('ele disse "oi"');
  });

  it("lida com CRLF e LF misturados", () => {
    const rows = parseCsv("A;B\r\n1;2\n3;4");
    expect(rows).toHaveLength(2);
  });

  it("preserva quebra de linha dentro de um campo entre aspas (achado real em bem_candidato_2026)", () => {
    const rows = parseCsv('SQ_CANDIDATO;DS_BEM_CANDIDATO;VR_BEM_CANDIDATO\n123;"POUPANÇA CAIXA: R$ 1.822,88\nPOUPANÇA BRADESCO: R$ 32.143,87";50000,00\n456;CASA;100000,00');
    expect(rows).toHaveLength(2);
    expect(rows[0].SQ_CANDIDATO).toBe("123");
    expect(rows[0].DS_BEM_CANDIDATO).toBe("POUPANÇA CAIXA: R$ 1.822,88\nPOUPANÇA BRADESCO: R$ 32.143,87");
    expect(rows[0].VR_BEM_CANDIDATO).toBe("50000,00");
    expect(rows[1].SQ_CANDIDATO).toBe("456");
  });

  it("ignora linhas em branco no meio ou no fim do arquivo", () => {
    const rows = parseCsv("A;B\n1;2\n\n3;4\n");
    expect(rows).toHaveLength(2);
    expect(rows[1]).toEqual({ A: "3", B: "4" });
  });
});

describe("acentuação e encoding (briefing 'ENCODING' — nunca assumir UTF-8)", () => {
  const names = ["João", "Gonçalves", "Espírito Santo", "Açu", "São Luís"];

  it("preserva corretamente caracteres acentuados quando decodificado como ISO-8859-1", () => {
    // Simula o TSE publicando o CSV em latin1: cada nome é codificado como
    // latin1 (como o TSE realmente faz) e decodificado do mesmo jeito que o
    // parser real faz — o texto deve sair idêntico ao original.
    for (const name of names) {
      const latin1Bytes = encodeLatin1(name);
      const decoded = decodeCsvBuffer(latin1Bytes, "iso-8859-1");
      expect(decoded).toBe(name);
    }
  });

  it("corrompe nomes acentuados se decodificado incorretamente como UTF-8 (prova que o encoding importa)", () => {
    const latin1Bytes = encodeLatin1("João");
    const decodedAsUtf8 = decodeCsvBuffer(latin1Bytes, "utf-8");
    expect(decodedAsUtf8).not.toBe("João");
  });

  it("faz round-trip de um CSV completo com nomes acentuados via parseTseCsv", () => {
    const csvText = `NM_URNA_CANDIDATO;NM_MUNICIPIO_NASCIMENTO\n${names[0]};${names[2]}\n${names[1]};${names[4]}`;
    const buffer = encodeLatin1(csvText);
    const rows = parseTseCsv(buffer, { encoding: "iso-8859-1" });
    expect(rows[0].NM_URNA_CANDIDATO).toBe("João");
    expect(rows[0].NM_MUNICIPIO_NASCIMENTO).toBe("Espírito Santo");
    expect(rows[1].NM_URNA_CANDIDATO).toBe("Gonçalves");
    expect(rows[1].NM_MUNICIPIO_NASCIMENTO).toBe("São Luís");
  });
});

/** Codifica uma string em bytes ISO-8859-1 (cada char vira 1 byte — válido para o subconjunto latin1). */
function encodeLatin1(text: string): ArrayBuffer {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) {
    bytes[i] = text.charCodeAt(i);
  }
  return bytes.buffer;
}
