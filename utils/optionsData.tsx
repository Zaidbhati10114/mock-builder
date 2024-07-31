// optionsData.ts
export interface Field {
  label: string;
  type: string;
}

export interface Option {
  fields: Field[];
}

export const optionsData: Record<string, Option> = {
  Phone: {
    fields: [
      { label: "IMEI", type: "text" },
      { label: "text", type: "text" },
    ],
  },
  Animal: {
    fields: [
      { label: "bear", type: "text" },
      { label: "bird", type: "text" },
      { label: "catName", type: "text" },
      { label: "dogName", type: "text" },
      { label: "fish", type: "text" },
      { label: "horse", type: "text" },
    ],
  },
  Lorem: {
    fields: [
      { label: "line", type: "text" },
      { label: "paragraph", type: "text" },
      { label: "paragraphs", type: "text" },
      { label: "slug", type: "text" },
    ],
  },
  Science: {
    fields: [
      { label: "chemicalElement", type: "text" },
      { label: "unit", type: "text" },
    ],
  },
};
