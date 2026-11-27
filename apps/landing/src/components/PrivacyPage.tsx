import privacyDocument from "../data/legal-privacy.json";
import type { LegalDocument } from "../types/legal";
import { LegalDocumentPage } from "./LegalDocumentPage";

export function PrivacyPage() {
  return (
    <LegalDocumentPage
      document={privacyDocument as LegalDocument}
      currentPath="/privacidad"
      breadcrumbLabel="Política de privacidad"
      titleDesktop="POLÍTICA DE PRIVACIDAD."
      titleMobile={
        <>
          POLÍTICA DE
          <br />
          PRIVACIDAD.
        </>
      }
    />
  );
}
