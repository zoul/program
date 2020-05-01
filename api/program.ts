import { NowRequest, NowResponse } from "@now/node";
import Airtable from "airtable";

interface Event {
  jmeno: string;
  datum: string;
  info: string;
  fb: string | null;
  promo: boolean;
  zverejnit: boolean;
}

export default async (_: NowRequest, response: NowResponse) => {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const table = new Airtable({ apiKey }).base("appKjB9jkVXK4YRGJ")("Program");
  try {
    const records = await table.select({ view: "Budoucí akce" }).all();
    const events = records.map(parseRecord).filter((e) => e.zverejnit);
    const out = JSON.stringify(events, null, 2);
    response.setHeader("Content-Type", "application/json");
    response.status(200).send(out);
  } catch (err) {
    response.status(500).send("AirTable read error.");
  }
};

function parseRecord(record: Airtable.Record<{}>): Event {
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
    info: f["Popis"],
    fb: f["FB událost"],
    promo: f["Promovat"],
    zverejnit: f["Zveřejnit"],
  };
}
