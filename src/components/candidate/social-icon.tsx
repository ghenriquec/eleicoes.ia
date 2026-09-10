import { Link as LinkIcon } from "lucide-react";

/**
 * lucide-react removeu os ícones de marca (Instagram/Facebook/X/...) das
 * versões recentes — só sobraram genéricos. Como as redes que aparecem em
 * `normalizeSocialUrl()` são um conjunto fixo e pequeno, desenhamos o
 * glifo de cada uma aqui em vez de puxar uma lib de ícones inteira.
 */

type IconProps = { size?: number; className?: string };

function Instagram({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function Facebook({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XTwitter({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTube({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a2.94 2.94 0 0 0-2.07-2.083C19.618 3.6 12 3.6 12 3.6s-7.618 0-9.428.503A2.94 2.94 0 0 0 .502 6.186 30.6 30.6 0 0 0 0 12a30.6 30.6 0 0 0 .502 5.814 2.94 2.94 0 0 0 2.07 2.083C4.382 20.4 12 20.4 12 20.4s7.618 0 9.428-.503a2.94 2.94 0 0 0 2.07-2.083A30.6 30.6 0 0 0 24 12a30.6 30.6 0 0 0-.502-5.814zM9.75 15.435V8.565L15.818 12z" />
    </svg>
  );
}

function LinkedIn({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.558V9h3.556z" />
    </svg>
  );
}

function TikTok({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.6 5.82c-.9-.88-1.45-2.03-1.53-3.32H12.6v13.63c0 1.65-1.34 3-3 3-.5 0-.97-.12-1.38-.34a2.97 2.97 0 0 1-1.62-2.66c0-1.65 1.34-3 3-3 .28 0 .55.04.8.11v-2.87a5.8 5.8 0 0 0-.8-.06c-3.18 0-5.76 2.58-5.76 5.76s2.58 5.76 5.76 5.76 5.76-2.58 5.76-5.76V9.4a8.53 8.53 0 0 0 4.98 1.6V8.1a5.75 5.75 0 0 1-3.14-2.28z" />
    </svg>
  );
}

function WhatsApp({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.188 8.188 0 0 1-1.26-4.38c.01-4.54 3.71-8.24 8.26-8.24zm-4.52 4.68c-.15 0-.4.06-.61.29-.21.24-.8.78-.8 1.9 0 1.12.82 2.2.93 2.35.11.15 1.61 2.6 4.02 3.54 1.99.78 2.4.62 2.83.58.43-.04 1.39-.57 1.58-1.11.2-.55.2-1.02.14-1.11-.06-.1-.21-.15-.44-.27-.23-.12-1.39-.68-1.6-.76-.21-.08-.37-.11-.53.11-.15.23-.61.76-.75.92-.14.15-.28.17-.51.06-.23-.12-.98-.36-1.87-1.15-.69-.62-1.16-1.38-1.29-1.61-.13-.23-.01-.35.1-.47.11-.11.23-.28.35-.42.11-.14.15-.24.23-.4.08-.16.04-.3-.02-.42-.06-.11-.53-1.31-.74-1.79-.19-.46-.39-.4-.53-.41-.14-.01-.29-.01-.44-.01z" />
    </svg>
  );
}

function Telegram({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.91 3.79L20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.55-1.1.55l.4-5.56 10.09-9.13c.44-.39-.1-.61-.68-.22L8.61 13.28l-5.45-1.7c-1.18-.37-1.2-1.18.26-1.75L22.09 2.01c.99-.36 1.86.24 1.82 1.78z" />
    </svg>
  );
}

function Threads({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.001c0-3.584.85-6.438 2.495-8.49C5.845 1.207 8.598.024 12.179 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717-1.334 1.663-2.01 4.08-2.012 7.184.002 3.104.678 5.522 2.011 7.184 1.43 1.782 3.63 2.695 6.54 2.717 2.623-.02 4.358-.64 5.8-2.08 1.638-1.638 1.606-3.65 1.098-4.842-.31-.732-.882-1.348-1.665-1.803-.202 1.436-.616 2.514-1.276 3.297-.937 1.115-2.263 1.732-3.938 1.777-1.194.02-2.354-.28-3.212-.87-.977-.67-1.526-1.646-1.55-2.74-.045-2.15 1.55-3.65 4.08-3.766.945-.043 1.83-.006 2.65.11-.09-.607-.294-1.09-.61-1.44-.44-.484-1.14-.734-2.075-.744-.844.01-1.6.246-2.19.685l-1.31-1.71c.943-.716 2.155-1.104 3.53-1.113 2.6.02 4.15 1.71 4.29 4.62.79.343 1.51.79 2.11 1.36 1.35 1.29 1.95 3.24 1.53 5.12-.42 1.87-1.67 3.34-3.34 4.13z" />
    </svg>
  );
}

function Spotify({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.719-.66 13.439 1.62.36.181.54.78.302 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function Bluesky({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.479 0-.688-.139-1.86-.902-2.203-.659-.299-1.664-.621-4.3 1.24C16.046 4.747 13.087 8.686 12 10.8Z" />
    </svg>
  );
}

function Flickr({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="7.5" cy="12" r="4.5" />
      <circle cx="16.5" cy="12" r="4.5" />
    </svg>
  );
}

function Linktree({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11 2h2v6.17l4.59-4.58L19 5l-5 5h5v2h-5l5 5-1.41 1.41L13 13.83V20h-2v-6.17l-4.59 4.58L5 17l5-5H5v-2h5L5 5l1.41-1.41L11 8.17z" />
    </svg>
  );
}

const PLATFORM_ICONS: Record<string, (props: IconProps) => React.JSX.Element> = {
  Instagram,
  Facebook,
  "X (Twitter)": XTwitter,
  YouTube,
  LinkedIn,
  TikTok,
  WhatsApp,
  Telegram,
  Threads,
  Spotify,
  Bluesky,
  Flickr,
  Linktree,
};

export function SocialIcon({ platform, size = 15, className }: { platform: string } & IconProps) {
  const Icon = PLATFORM_ICONS[platform];
  if (Icon) return <Icon size={size} className={className} />;
  return <LinkIcon size={size} className={className} />; // Kwai e domínios não catalogados — sem logo próprio desenhado
}
