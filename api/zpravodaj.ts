import { NowRequest, NowResponse } from "@now/node";
import { parseEvent } from "./_shared";
import Airtable from "airtable";

export default async (_: NowRequest, response: NowResponse) => {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const table = new Airtable({ apiKey }).base("appKjB9jkVXK4YRGJ")("Program");
  try {
    const records = await table.select({ view: "Budoucí akce" }).all();
    const events = records.map(parseEvent).filter((e) => e.zverejnit);
    const print = (s: string) => response.write(`${s}\n`);
    response.setHeader("Content-Type", "text/plain; charset=UTF-8");
    response.status(200);
    for (const event of events) {
      const date = event.datumPresne;
      if (date == null) {
        continue;
      }
      print(formatDate(event.datumPresne));
      print(`Prostor ${formatTime(event.datumPresne)}`);
      print(event.jmeno);
      print(event.info);
      print("\n");
    }
    response.end();
  } catch (err) {
    response.status(500).send("AirTable read error.");
  }
};

function formatDate(d: Date): string {
  const options = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  return d.toLocaleDateString("cs-CZ", options);
}

function formatTime(d: Date): string {
  const options = {
    hour: "numeric",
    minute: "numeric",
  };
  return d.toLocaleTimeString("cs-CZ", options);
}
