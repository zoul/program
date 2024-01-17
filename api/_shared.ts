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
      odkaz: field("Odkaz na web", urlProp),
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
  jmeno: string | null;
  datum: string | null;
  datumPresne: Date | null;
  sekce: string | null;
  info: string | null;
  fb: string | null;
  odkaz: string | null;
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

  return (
    events
      // Only published events
      .filter((e) => e.zverejnit)
      // Only future events
      .filter((e) => e.datumPresne != null && e.datumPresne >= new Date())
      // Sort by date
      .sort((a, b) => +a.datumPresne! - +b.datumPresne!)
  );
}

function unwrapEventPage(page: EventPage): Event {
  const p = page.props;
  return {
    jmeno: p.jmeno.value.at(0)?.plainText || null,
    datum: p.datum?.value.at(0)?.plainText || null,
    datumPresne: p.datumPresne?.date?.start || null,
    sekce: map(categorizeDate, p.datumPresne?.date?.start || null),
    info: p.info.value.at(0)?.plainText || null,
    fb: p.fb.value,
    odkaz: p.odkaz.value,
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

//
// Helpers
//

const stripAccents = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const normalizeGenre = (s: string) => stripAccents(s).toLowerCase();

const daysBetweenDays = (a: Date, b: Date) => (+a - +b) / (1000 * 60 * 60 * 24);

const categorizeDate = (d: Date) => {
  const diff = daysBetweenDays(d, new Date());
  if (diff < 0) {
    return "proběhlo";
  } else if (diff < 30) {
    return "nejbližší měsíc";
  } else if (diff < 60) {
    return "na obzoru";
  } else {
    return "připravujeme";
  }
};

function map<T, U>(f: (t: T) => U, val: T | null): U | null {
  return val != null ? f(val) : null;
}
