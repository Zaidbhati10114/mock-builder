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
  Color: {
    fields: [
      { label: "rgb", type: "text" },
      { label: "hex", type: "text" },
      { label: "hsl", type: "text" },
      { label: "colorName", type: "text" },
    ],
  },
  Image: {
    fields: [
      { label: "avatar", type: "text" },
      { label: "imageUrl", type: "text" },
      { label: "dataUri", type: "text" },
    ],
  },
  Random: {
    fields: [
      { label: "uuid", type: "text" },
      { label: "boolean", type: "boolean" },
      { label: "alpha", type: "text" },
      { label: "alphaNumeric", type: "text" },
    ],
  },
  Company: {
    fields: [
      { label: "companyName", type: "text" },
      { label: "catchPhrase", type: "text" },
      { label: "bs", type: "text" },
      { label: "ein", type: "text" },
    ],
  },
  Database: {
    fields: [
      { label: "column", type: "text" },
      { label: "type", type: "text" },
      { label: "collation", type: "text" },
      { label: "engine", type: "text" },
    ],
  },
  Internet: {
    fields: [
      { label: "email", type: "text" },
      { label: "exampleEmail", type: "text" },
      { label: "userName", type: "text" },
      { label: "domainName", type: "text" },
      { label: "url", type: "text" },
      { label: "ip", type: "text" },
      { label: "ipv6", type: "text" },
      { label: "userAgent", type: "text" },
    ],
  },
  Location: {
    fields: [
      { label: "latitude", type: "text" },
      { label: "longitude", type: "text" },
      { label: "country", type: "text" },
      { label: "countryCode", type: "text" },
      { label: "city", type: "text" },
      { label: "state", type: "text" },
      { label: "streetAddress", type: "text" },
      { label: "zipCode", type: "text" },
    ],
  },
  Date: {
    fields: [
      { label: "past", type: "date" },
      { label: "future", type: "date" },
      { label: "recent", type: "date" },
      { label: "month", type: "text" },
      { label: "weekday", type: "text" },
    ],
  },
  Word: {
    fields: [
      { label: "adjective", type: "text" },
      { label: "adverb", type: "text" },
      { label: "conjunction", type: "text" },
      { label: "interjection", type: "text" },
      { label: "noun", type: "text" },
      { label: "verb", type: "text" },
    ],
  },
  DataType: {
    fields: [
      { label: "number", type: "number" },
      { label: "float", type: "number" },
      { label: "datetime", type: "date" },
      { label: "string", type: "text" },
      { label: "uuid", type: "text" },
      { label: "boolean", type: "boolean" },
      { label: "hexadecimal", type: "text" },
      { label: "json", type: "text" },
    ],
  },
  Vehicle: {
    fields: [
      { label: "manufacturer", type: "text" },
      { label: "model", type: "text" },
      { label: "type", type: "text" },
      { label: "fuel", type: "text" },
      { label: "vin", type: "text" },
      { label: "color", type: "text" },
    ],
  },
  Music: {
    fields: [
      { label: "genre", type: "text" },
      { label: "songName", type: "text" },
      { label: "artist", type: "text" },
      { label: "instrument", type: "text" },
    ],
  },
  Finance: {
    fields: [
      { label: "accountName", type: "text" },
      { label: "accountNumber", type: "text" },
      { label: "amount", type: "number" },
      { label: "transactionType", type: "text" },
      { label: "currencyCode", type: "text" },
      { label: "bitcoinAddress", type: "text" },
    ],
  },
  Hacker: {
    fields: [
      { label: "abbreviation", type: "text" },
      { label: "adjective", type: "text" },
      { label: "noun", type: "text" },
      { label: "verb", type: "text" },
      { label: "phrase", type: "text" },
    ],
  },
  Food: {
    fields: [
      { label: "dish", type: "text" },
      { label: "ingredient", type: "text" },
      { label: "fruit", type: "text" },
      { label: "vegetable", type: "text" },
      { label: "spice", type: "text" },
    ],
  },
  Sport: {
    fields: [
      { label: "sportName", type: "text" },
      { label: "teamName", type: "text" },
      { label: "athlete", type: "text" },
      { label: "position", type: "text" },
    ],
  },
};
