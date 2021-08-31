import { Client } from "@notionhq/client";

import {
  CheckboxPropertyValue,
  NumberPropertyValue,
  Page,
  DatePropertyValue,
  RichTextPropertyValue,
  SelectPropertyValue,
  TitlePropertyValue,
  URLPropertyValue,
} from "@notionhq/client/build/src/api-types";

interface EventPage extends Page {
  properties: {
    "Název"?: TitlePropertyValue;
    "Popis"?: RichTextPropertyValue;
    "Kdy"?: RichTextPropertyValue;
    "FB událost"?: URLPropertyValue;
    "Vstupenky"?: URLPropertyValue;
    "Zveřejnit"?: CheckboxPropertyValue;
    "Kdy přesně"?: DatePropertyValue;
    "Vstupné"?: NumberPropertyValue;
    "Žánr"?: SelectPropertyValue;
    "Promovat"?: CheckboxPropertyValue;
    "Zrušeno"?: CheckboxPropertyValue;
  };
}

export interface Event {
  jmeno: string;
  datum: string | null;
  datumPresne: Date | null;
  info: string;
  fb: string | null;
  vstupenky: string | null;
  vstupne: number | null;
  zanr: string | null;
  streaming: boolean;
  promo: boolean;
  zverejnit: boolean;
  zruseno: boolean;
}

export async function allFutureEvents(apiKey: string): Promise<Event[]> {
  const notion = new Client({ auth: apiKey });
  const databaseId = "030ee6a0cbbf40bc9b5cbae4001f0d8e";
  const dbResponse = await notion.databases.query({
    database_id: databaseId,
    sorts: [{ property: "Kdy přesně", direction: "descending" }],
  });
  return dbResponse.results
    .map(parsePage)
    .filter((b) => b != null)
    .filter((e) => e.datumPresne != null && e.datumPresne >= new Date())
    .sort((a, b) => +a.datumPresne - +b.datumPresne);
}

function parsePage(page: Page): Event | null {
  const props = (page as EventPage).properties;

  const zverejnit = props["Zveřejnit"]?.checkbox?.valueOf() ?? false;
  if (zverejnit !== true) {
    return null;
  }

  const jmeno = props["Název"]?.title[0]?.plain_text;
  const info = props["Popis"]?.rich_text[0]?.plain_text;
  const datumPresne = new Date(props["Kdy přesně"]?.date.start);
  const datum = props["Kdy"]?.rich_text[0]?.plain_text;
  const fb = parseURL(props["FB událost"]?.url);
  const vstupenky = parseURL(props["Vstupenky"]?.url);
  const vstupne = props["Vstupné"]?.number;
  const zanr = map(parseGenre, props["Žánr"]?.select?.name);
  const promo = props["Promovat"]?.checkbox?.valueOf() ?? false;
  const zruseno = props["Zrušeno"]?.checkbox?.valueOf() ?? false;

  const streaming = false;

  return {
    jmeno,
    datum,
    datumPresne,
    info,
    fb,
    zanr,
    streaming,
    vstupenky,
    vstupne,
    promo,
    zverejnit,
    zruseno,
  };
}

const parseGenre = (s: string) => stripAccents(s).toLowerCase();
const parseURL = (s: string) => (s === "" ? undefined : s);

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function map<T, U>(f: (t: T) => U, val: T | null): U | null {
  return val != null ? f(val) : null;
}
