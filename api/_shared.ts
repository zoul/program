import { Client } from "@notionhq/client";
import {
  array,
  decodeType,
  field,
  literal,
  record,
} from "typescript-json-decoder";
import {
  checkboxProp,
  dateProp,
  numberProp,
  richTextProp,
  selectProp,
  titleProp,
  urlProp,
} from "./_notion";

process.env.TZ = "Europe/Prague";

type EventPage = decodeType<typeof decodeEventPage>;
const decodeEventPage = record({
  object: literal("page"),
  props: field(
    "properties",
    record({
      jmeno: field("Název", titleProp),
      datum: field("Kdy", richTextProp),
      datumPresne: field("Kdy přesně", dateProp),
      info: field("Popis", richTextProp),
      fb: field("FB událost", urlProp),
      vstupenky: field("Vstupenky", urlProp),
      vstupne: field("Vstupné", numberProp),
      doporuceneVstupne: field("Doporučené vstupné", numberProp),
      zanr: field("Žánr", selectProp),
      promo: field("Promovat", checkboxProp),
      zruseno: field("Zrušeno", checkboxProp),
      zverejnit: field("Zveřejnit", checkboxProp),
    })
  ),
});

export interface Event {
  jmeno: string;
  datum: string | null;
  datumPresne: Date | null;
  info: string;
  fb: string | null;
  vstupenky: string | null;
  vstupne: number | null;
  doporuceneVstupne: number | null;
  zanr: string | null;
  streaming: boolean | null;
  promo: boolean;
  zverejnit: boolean;
  zruseno: boolean;
}

export async function allFutureEvents(apiKey: string): Promise<Event[]> {
  const decodeQueryResponse = record({
    object: literal("list"),
    results: array(decodeEventPage),
  });
  const notion = new Client({ auth: apiKey });
  const events = await notion.databases
    .query({
      database_id: "030ee6a0cbbf40bc9b5cbae4001f0d8e",
    })
    .then(decodeQueryResponse)
    .then((response) => response.results)
    .then((pages) => pages.map(unwrapEventPage));

  return events
    .filter((e) => e.datumPresne != null && e.datumPresne >= new Date())
    .sort((a, b) => +a.datumPresne! - +b.datumPresne!);
}

function unwrapEventPage(page: EventPage): Event {
  const stripAccents = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalizeGenre = (value: string) => stripAccents(value).toLowerCase();
  const p = page.props;
  return {
    jmeno: p.jmeno.value[0]?.plainText,
    datum: p.datum?.value[0]?.plainText || null,
    datumPresne: p.datumPresne?.date?.start || null,
    info: p.info.value[0]?.plainText,
    fb: p.fb.value,
    zanr: map(normalizeGenre, p.zanr.select?.name || null),
    streaming: false,
    vstupenky: p.vstupenky.value,
    vstupne: p.vstupne.value,
    doporuceneVstupne: p.doporuceneVstupne?.value || null,
    promo: p.promo.value,
    zverejnit: p.zverejnit.value,
    zruseno: p.zruseno.value,
  };
}

function map<T, U>(f: (t: T) => U, val: T | null): U | null {
  return val != null ? f(val) : null;
}
