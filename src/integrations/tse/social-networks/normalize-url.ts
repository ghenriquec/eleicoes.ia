/**
 * `DS_URL` é texto livre digitado pelo próprio candidato no formulário de
 * candidatura — não é um campo validado pelo TSE. Na prática isso produz
 * lixo real: link com nome colado depois ("...IGSH=ABC==  FULANO DE TAL"),
 * usuário sem link ("FACEBOOK  @FULANO"), nome puro sem nenhuma URL. Nunca
 * inventamos um link que o candidato não declarou — se não dá pra montar
 * uma URL navegável de verdade, a linha é descartada (não é omissão de
 * dado oficial, é filtro de qualidade sobre um campo de texto livre).
 */

const PLATFORM_PATTERNS: [pattern: RegExp, platform: string][] = [
  // grafias erradas de "instagram" aparecem de verdade no dataset (candidato digitou à mão,
  // às vezes até esquecendo o ".com") — o link pode não resolver, mas a intenção é clara o
  // suficiente pra rotular. Testado contra o host já sem "www." — ver normalizeSocialUrl.
  [/^(instagram|instagran|intagram|nstagram|instragram)(\.|$)/i, "Instagram"],
  [/facebook\.com|fb\.com|^m\.me$/i, "Facebook"],
  [/twitter\.com|x\.com/i, "X (Twitter)"],
  [/tiktok\.com/i, "TikTok"],
  [/youtube\.com|youtu\.be/i, "YouTube"],
  [/linkedin\.com/i, "LinkedIn"],
  [/threads\.(net|com)/i, "Threads"],
  [/kwai(-video)?\.com/i, "Kwai"],
  [/wa\.me|chat\.whatsapp\.com|whatsapp\.com/i, "WhatsApp"],
  [/t\.me|telegram/i, "Telegram"],
  [/bsky\.(app|social)/i, "Bluesky"],
  [/open\.spotify\.com/i, "Spotify"],
  [/linktr\.ee|^tr\.ee$/i, "Linktree"],
  [/flickr\.com/i, "Flickr"],
];

/** parece um domínio (tem um "." seguido de 2+ letras antes de barra/fim/query) */
const DOMAIN_LIKE = /^[^\s/]+\.[a-z]{2,}([/?#].*)?$/i;

export function normalizeSocialUrl(raw: string): { url: string; platform: string } | null {
  // o TSE às vezes concatena texto extra depois de um espaço duplo/tab — pega só o primeiro token
  const firstToken = raw.trim().split(/\s{2,}|\t/)[0].trim();
  if (!firstToken) return null;

  let candidate = firstToken;
  if (!/^https?:\/\//i.test(candidate)) {
    // "fulano@gmail.com" bate no regex de domínio (o "@" vira userinfo na URL) — é e-mail
    // digitado no campo de rede social por engano, não uma rede social. Descarta antes de montar a URL.
    if (candidate.includes("@")) return null;
    if (!DOMAIN_LIKE.test(candidate)) return null; // não parece nem domínio — provavelmente nome/handle solto
    candidate = `https://${candidate}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }
  if (!parsed.hostname.includes(".")) return null;
  if (parsed.username || /@gmail\.|@hotmail\.|@yahoo\.|@outlook\./i.test(candidate)) return null; // e-mail com esquema explícito

  const host = parsed.hostname.replace(/^www\./i, "");
  const platform = PLATFORM_PATTERNS.find(([pattern]) => pattern.test(host))?.[1] ?? host;
  return { url: parsed.toString(), platform };
}
