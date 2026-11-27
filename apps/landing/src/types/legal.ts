export type LegalTableRow = {
  provider: string;
  role: string;
  data: string;
};

export type LegalBlock =
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; text: string }
  | { type: "table"; rows: LegalTableRow[] }
  | { type: "related_label"; text: string }
  | { type: "related_link"; text: string; href: string };

export type LegalSection = {
  number: number | null;
  title: string;
  slug: string;
  blocks: LegalBlock[];
};

export type LegalIndexItem = {
  num: string;
  label: string;
  slug: string;
};

export type LegalDocument = {
  index: LegalIndexItem[];
  sections: LegalSection[];
  meta: {
    updatedAt: string;
    version: string;
    effectiveFrom: string;
  };
};
