import { describe, it, expect } from "vitest";
import { normalizeSocialUrl } from "./normalize-url";

describe("normalizeSocialUrl", () => {
  it("reconhece uma URL completa e detecta a plataforma", () => {
    expect(normalizeSocialUrl("HTTPS://WWW.INSTAGRAM.COM/SAMARAHEADLEY/")).toEqual({
      url: "https://www.instagram.com/SAMARAHEADLEY/",
      platform: "Instagram",
    });
  });

  it("descarta texto extra colado depois de espaço duplo (achado real do dataset)", () => {
    const result = normalizeSocialUrl("HTTPS://WWW.INSTAGRAM.COM/DRWASHINGTONRA?IGSH=ABC==  DR. WASHINGT");
    expect(result?.url).toBe("https://www.instagram.com/DRWASHINGTONRA?IGSH=ABC==");
    expect(result?.platform).toBe("Instagram");
  });

  it("aceita domínio sem protocolo e usa o próprio host como rótulo quando não é uma rede conhecida", () => {
    expect(normalizeSocialUrl("WWW.GUTOSCHIAVETTO.COM.BR")).toEqual({
      url: "https://www.gutoschiavetto.com.br/",
      platform: "gutoschiavetto.com.br",
    });
  });

  it("descarta um nome/handle solto sem domínio nenhum", () => {
    expect(normalizeSocialUrl("EDUARDO LIMA LIMA")).toBeNull();
    expect(normalizeSocialUrl("FACEBOOK  @ANDREIAGRUTDNER")).toBeNull();
  });

  it("reconhece WhatsApp", () => {
    expect(normalizeSocialUrl("HTTPS://WA.ME/6992881468")?.platform).toBe("WhatsApp");
  });

  it("reconhece Bluesky, Spotify, Linktree e Flickr (achados reais do dataset)", () => {
    expect(normalizeSocialUrl("https://bsky.app/profile/exemplo.bsky.social")?.platform).toBe("Bluesky");
    expect(normalizeSocialUrl("https://open.spotify.com/show/abc123")?.platform).toBe("Spotify");
    expect(normalizeSocialUrl("linktr.ee/candidatoexemplo")?.platform).toBe("Linktree");
    expect(normalizeSocialUrl("https://www.flickr.com/photos/exemplo")?.platform).toBe("Flickr");
  });

  it("reconhece grafias erradas comuns de Instagram no dataset real", () => {
    expect(normalizeSocialUrl("HTTPS://WWW.INSTAGRAN.COM/EXEMPLO")?.platform).toBe("Instagram");
    expect(normalizeSocialUrl("HTTPS://INTAGRAM.COM/EXEMPLO")?.platform).toBe("Instagram");
    // achado real: candidato esqueceu o ".com" inteiro
    expect(normalizeSocialUrl("https://www.instagran/FULANO")?.platform).toBe("Instagram");
    // achado real: candidato usou ".com.br"
    expect(normalizeSocialUrl("https://instagram.com.br/FULANO")?.platform).toBe("Instagram");
  });

  it("reconhece o domínio do Kwai usado em compartilhamento de vídeo", () => {
    expect(normalizeSocialUrl("https://kwai-video.com/p/abc123")?.platform).toBe("Kwai");
  });

  it("reconhece link curto do Messenger (m.me) como Facebook", () => {
    expect(normalizeSocialUrl("https://m.me/exemplo")?.platform).toBe("Facebook");
  });

  it("descarta e-mail digitado por engano no campo de rede social (achado real do dataset)", () => {
    expect(normalizeSocialUrl("fulano.exemplo@gmail.com")).toBeNull();
    expect(normalizeSocialUrl("https://fulano.exemplo@gmail.com")).toBeNull();
    expect(normalizeSocialUrl("exemplo@hotmail.com")).toBeNull();
  });
});
