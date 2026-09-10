import { describe, it, expect } from "vitest";
import { tagItemsAgainstKeywords, buildKeyword } from "./election-filter";
import type { RawNewsItem } from "./rss-parser";

function item(title: string): RawNewsItem {
  return { title, link: `https://example.com/${encodeURIComponent(title)}`, pubDate: new Date(), sourceId: "test", sourceName: "Teste" };
}

const lula = buildKeyword("lula-13-br", "LULA", "presidente", "PT", "BR", "Brasil");
const flavio = buildKeyword("flavio-bolsonaro-22-br", "FLAVIO BOLSONARO", "presidente", "PL", "BR", "Brasil");
const gabriel = buildKeyword("gabriel-15-mg", "GABRIEL", "governador", "REPUBLICANOS", "MG", "Minas Gerais");
const keywords = [lula, flavio, gabriel];

describe("tagItemsAgainstKeywords", () => {
  it("bate nome de urna de múltiplas palavras sem precisar de corroboração", () => {
    const tagged = tagItemsAgainstKeywords([item("Justiça suspende propaganda de Flávio Bolsonaro")], keywords);
    expect(tagged).toHaveLength(1);
    expect(tagged[0].matchedCandidateSlug).toBe("flavio-bolsonaro-22-br");
    expect(tagged[0].category).toBe("Presidência");
    expect(tagged[0].matchedCandidateUf).toBeNull(); // presidente é nacional, não tem UF
  });

  it("bate nome de uma palavra só quando corroborado por termo genérico de eleição", () => {
    const tagged = tagItemsAgainstKeywords([item("Eleições 2026: Lula lidera pesquisa no Nordeste")], keywords);
    expect(tagged[0]?.matchedCandidateSlug).toBe("lula-13-br");
  });

  it("bate nome de uma palavra só quando corroborado pelo cargo", () => {
    const tagged = tagItemsAgainstKeywords([item("Presidente Lula recebe empresários em Brasília")], keywords);
    expect(tagged[0]?.matchedCandidateSlug).toBe("lula-13-br");
  });

  it("NÃO bate nome de uma palavra só sem nenhuma corroboração (achado real: futebol)", () => {
    const tagged = tagItemsAgainstKeywords([item("Técnico do Barcelona é direto sobre Gabriel Jesus")], keywords);
    expect(tagged).toHaveLength(0);
  });

  it("bate nome de uma palavra só quando corroborado pelo partido", () => {
    const tagged = tagItemsAgainstKeywords([item("Candidato do Republicanos, Gabriel, participa de debate em BH")], keywords);
    expect(tagged[0]?.matchedCandidateSlug).toBe("gabriel-15-mg");
    expect(tagged[0]?.category).toBe("Eleições");
    expect(tagged[0]?.matchedCandidateUf).toBe("MG");
  });

  it("mantém item sem candidato quando só o termo genérico de eleição bate", () => {
    const tagged = tagItemsAgainstKeywords([item("Eleições 2026: o que muda no calendário eleitoral")], keywords);
    expect(tagged[0]?.matchedCandidateSlug).toBeNull();
    expect(tagged[0]?.category).toBe("Eleições");
  });

  it("descarta item sem nenhum sinal de relevância eleitoral", () => {
    const tagged = tagItemsAgainstKeywords([item("Dólar fecha em queda nesta terça-feira")], keywords);
    expect(tagged).toHaveLength(0);
  });

  it("prefere o nome mais específico quando dois candidatos batem na mesma manchete (achado real)", () => {
    const renanSantos = buildKeyword("renan-santos-14-br", "RENAN SANTOS", "presidente", "MISSÃO", "BR", "Brasil");
    const renanPe = buildKeyword("renan-14-pe", "RENAN", "governador", "MISSÃO", "PE", "Pernambuco");
    // "Missão" corrobora o Renan de PE (partido) mas a manchete também contém "Renan Santos" inteiro
    const tagged = tagItemsAgainstKeywords([item("Renan Santos e Missão fazem post após decisão de Toffoli")], [renanSantos, renanPe]);
    expect(tagged[0]?.matchedCandidateSlug).toBe("renan-santos-14-br");
  });
});
