import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { ClearDataButton } from "@/components/layout/clear-data-button";

export const metadata: Metadata = { title: "Privacidade" };

export default function PrivacidadePage() {
  return (
    <LegalPage title="Privacidade" subtitle="Suas escolhas nunca saem do seu aparelho.">
      <p>
        Suas escolhas na cola eleitoral revelam opiniões políticas — um dado sensível. Por padrão, essas informações
        ficam salvas apenas no armazenamento local do seu navegador (localStorage), no seu próprio aparelho.
      </p>
      <ul>
        <li>Nunca associamos suas escolhas a nome, e-mail, CPF ou qualquer conta.</li>
        <li>Nunca enviamos suas escolhas da cola para ferramentas de publicidade (Meta Pixel, Google Ads) ou analytics de terceiros.</li>
        <li>Não existe sistema de login nesta plataforma — não há identidade para associar a uma opinião.</li>
        <li>Você pode apagar tudo a qualquer momento, abaixo. A exclusão é imediata porque não existe cópia no servidor.</li>
      </ul>

      <h2>Localização automática</h2>
      <p>
        Na primeira visita, o site pode pedir permissão ao seu navegador para detectar automaticamente o seu estado
        (usando o prompt nativo do próprio navegador — nunca uma tela nossa fingindo ser esse pedido). Se você
        permitir, suas coordenadas são enviadas diretamente do seu navegador para a BigDataCloud, um serviço de
        geocodificação reversa, que devolve apenas o estado correspondente. Essa chamada nunca passa pelo nosso
        servidor, e nós só guardamos o resultado (a sigla do estado) no seu aparelho. Se você recusar ou fechar o
        pedido, nada acontece — o site continua funcionando normalmente e você escolhe seu estado manualmente onde
        for preciso. Você pode trocar o estado detectado a qualquer momento.
      </p>

      <h2>Apagar meus dados agora</h2>
      <p>Isso remove seu estado salvo e sua cola eleitoral deste navegador.</p>
      <ClearDataButton />
    </LegalPage>
  );
}
