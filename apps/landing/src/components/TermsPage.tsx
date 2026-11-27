import termsDocument from "../data/legal-terms.json";
import type { LegalDocument } from "../types/legal";
import { LegalDocumentPage } from "./LegalDocumentPage";

export function TermsPage() {
  return (
    <LegalDocumentPage
      document={termsDocument as LegalDocument}
      currentPath="/terminos"
      breadcrumbLabel="Términos y condiciones"
      titleDesktop="TÉRMINOS Y CONDICIONES."
      titleMobile={
        <>
          TÉRMINOS Y
          <br />
          CONDICIONES.
        </>
      }
    />
  );
}
