import { describe, it, expect } from "vitest";
import { formatRelativeTime } from "./format-relative-time";

describe("formatRelativeTime", () => {
  const now = new Date("2026-09-01T12:00:00-03:00");

  it("mostra 'agora' para menos de 1 minuto", () => {
    expect(formatRelativeTime(new Date("2026-09-01T11:59:30-03:00"), now)).toBe("agora");
  });

  it("mostra minutos para menos de 1 hora", () => {
    expect(formatRelativeTime(new Date("2026-09-01T11:28:00-03:00"), now)).toBe("há 32 minutos");
  });

  it("mostra horas para menos de 1 dia", () => {
    expect(formatRelativeTime(new Date("2026-09-01T09:00:00-03:00"), now)).toBe("há 3 horas");
  });

  it("usa forma idiomática do pt-BR pra dias próximos (numeric: 'auto')", () => {
    expect(formatRelativeTime(new Date("2026-08-30T12:00:00-03:00"), now)).toBe("anteontem");
  });

  it("mostra dias numéricos quando não há forma idiomática", () => {
    expect(formatRelativeTime(new Date("2026-08-25T12:00:00-03:00"), now)).toBe("há 7 dias");
  });
});
