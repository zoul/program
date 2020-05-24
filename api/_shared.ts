import Airtable from "airtable";

export interface Event {
  jmeno: string;
  datum: string;
  datumPresne: Date | null;
  info: string;
  fb: string | null;
  vstupenky: string | null;
  zanr: string | null;
  streaming: boolean;
  promo: boolean;
  zverejnit: boolean;
}

export async function allFutureEvents(apiKey: string): Promise<Event[]> {
  const table = new Airtable({ apiKey }).base("appKjB9jkVXK4YRGJ")("Program");
  const records = await table.select({ view: "Budoucí akce" }).all();
  return records.map(parseEvent).filter((e) => e.zverejnit);
}

export function parseEvent(record: Airtable.Record<{}>): Event {
  const options = {
    weekday: "long",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("cs-CZ", options);
  const f = record.fields;
  return {
    jmeno: f["Název"],
    datum: f["Kdy"] || formatDate(f["Kdy přesně"]),
    datumPresne: map((x) => new Date(x), f["Kdy přesně"]),
    info: f["Popis"],
    fb: f["FB událost"],
    vstupenky: f["Vstupenky"],
    zanr: map(stripAccents, f["Žánr"]),
    streaming: f["Streaming"],
    promo: f["Promovat"],
    zverejnit: f["Zveřejnit"],
  };
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function map<T, U>(f: (t: T) => U, val: T | null): U | null {
  return val != null ? f(val) : null;
}
