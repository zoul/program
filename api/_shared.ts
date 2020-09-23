import Airtable from "airtable";

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
  const table = new Airtable({ apiKey }).base("appKjB9jkVXK4YRGJ")("Program");
  const records = await table.select({ view: "Budoucí akce" }).all();
  return records.map(parseEvent).filter((e) => e.zverejnit);
}

export function parseEvent(record: Airtable.Record<{}>): Event {
  const f = record.fields;
  return {
    jmeno: f["Název"],
    datum: f["Kdy"],
    datumPresne: map((x) => new Date(x), f["Kdy přesně"]),
    info: f["Popis"],
    fb: f["FB událost"],
    vstupenky: f["Vstupenky"],
    vstupne: f["Doporučené vstupné"],
    zanr: map(parseGenre, f["Žánr"]),
    streaming: f["Streaming"],
    promo: f["Promovat"],
    zverejnit: f["Zveřejnit"],
    zruseno: f["Zrušeno"] || false,
  };
}

function parseGenre(s: string): string {
  return stripAccents(s).toLowerCase();
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function map<T, U>(f: (t: T) => U, val: T | null): U | null {
  return val != null ? f(val) : null;
}
