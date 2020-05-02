import Airtable from "airtable";

export interface Event {
  jmeno: string;
  datum: string;
  datumPresne: Date | null;
  info: string;
  fb: string | null;
  promo: boolean;
  zverejnit: boolean;
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
    promo: f["Promovat"],
    zverejnit: f["Zveřejnit"],
  };
}

function map<T, U>(f: (t: T) => U, val: T | null): U | null {
  return val != null ? f(val) : null;
}
