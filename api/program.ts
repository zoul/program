import { NowRequest, NowResponse } from "@now/node";
import { allFutureEvents } from "./_shared";

export default async (_: NowRequest, response: NowResponse) => {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const formatDate = (d: Date) =>
    d.toLocaleDateString("cs-CZ", {
      weekday: "long",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  try {
    const events = await allFutureEvents(apiKey);
    for (var event of events) {
      if (event.datum == null && event.datumPresne != null) {
        event.datum = formatDate(event.datumPresne);
      }
    }
    const out = JSON.stringify(events, null, 2);
    response.setHeader("Content-Type", "application/json");
    response.status(200).send(out);
  } catch (err) {
    response.status(500).send("AirTable read error.");
  }
};
