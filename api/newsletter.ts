import { NowRequest, NowResponse } from "@now/node";
import { allFutureEvents } from "./_shared";

export default async (_: NowRequest, response: NowResponse) => {
  const apiKey = process.env.AIRTABLE_API_KEY;
  try {
    const events = await allFutureEvents(apiKey);
    const print = (s: string) => response.write(`${s}\n`);
    response.setHeader("Content-Type", "text/html; charset=UTF-8");
    response.status(200);
    for (const event of events) {
      const date = event.datumPresne;
      if (date == null) {
        continue;
      }
      if (event.fb != null) {
        print(`<h2><a href="${event.fb}">${event.jmeno}</a></h2>`);
      } else {
        print(`<h2>${event.jmeno}</h2>`);
      }
      print(`<p style="text-transform: uppercase">
        ${formatDate(event.datumPresne)}  ${formatTime(event.datumPresne)}
      </p>`);
      print(`<p>${event.info}</p>`);
      print("\n");
    }
    response.end();
  } catch (err) {
    response.status(500).send("AirTable read error.");
  }
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("cs-CZ", {
    weekday: "long",
    month: "numeric",
    day: "numeric",
  });
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("cs-CZ", {
    hour: "numeric",
    minute: "numeric",
  });
}
