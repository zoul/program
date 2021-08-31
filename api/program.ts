import { VercelRequest, VercelResponse } from "@vercel/node";
import { allFutureEvents } from "./_shared";

export default async (_: VercelRequest, response: VercelResponse) => {
  const apiKey = process.env.NOTION_API_KEY;
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
    response.setHeader(
      "Cache-Control",
      "max-age=0, s-maxage=60, stale-while-revalidate=86400"
    );
    response.status(200).send(out);
  } catch (err) {
    response.status(500).send(err);
  }
};
