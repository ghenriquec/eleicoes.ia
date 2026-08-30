import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { ClearDataButton } from "@/components/layout/clear-data-button";

export const metadata: Metadata = { title: "Privacidade" };

export default function PrivacidadePage() {
  return (
    <LegalPage title="Privacidade" subtitle="Suas opiniões políticas nunca saem do seu aparelho.">
      <p>
        Respostas do quiz e escolhas da sua cola eleitoral revelam opiniões políticas — um dado sensível. Por
        padrão, essas informações ficam salvas apenas no armazenamento local do seu navegador (localStorage), no seu
        próprio aparelho.
      </p>
      <ul>
        <li>Nunca associamos suas respostas a nome, e-mail, CPF ou qualquer conta.</li>
        <li>Nunca enviamos respostas do quiz ou escolhas da cola para ferramentas de publicidade (Meta Pixel, Google Ads) ou analytics de terceiros.</li>
        <li>Não existe sistema de login nesta plataforma — não há identidade para associar a uma opinião.</li>
        <li>Você pode apagar tudo a qualquer momento, abaixo. A exclusão é imediata porque não existe cópia no servidor.</li>
      </ul>

      <h2>Apagar meus dados agora</h2>
      <p>Isso remove seu estado salvo, respostas do quiz e sua cola eleitoral deste navegador.</p>
      <ClearDataButton />
    </LegalPage>
  );
}
