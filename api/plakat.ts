import { VercelRequest, VercelResponse } from "@vercel/node";
import { allFutureEvents, Event } from "./_shared";

export default async (_: VercelRequest, response: VercelResponse) => {
  const apiKey = process.env.NOTION_API_KEY || "";
  try {
    const events = await allFutureEvents(apiKey);
    response.setHeader("Content-Type", "text/plain; charset=UTF-8");
    response.status(200).send(
      events
        .filter((e) => e.datumPresne != null)
        .filter((e) => !e.zruseno)
        .map(viewEvent)
        .join("\n")
    );
  } catch (err) {
    response.status(500).send(err);
  }
};

function viewEvent(event: Event): string {
  const items = event.datum
    ? [event.datum, event.jmeno, event.info, ""]
    : [
        viewDate(event.datumPresne!),
        viewTime(event.datumPresne!),
        event.jmeno,
        event.info,
        "",
      ];
  return items.join("\n");
}

function viewDate(d: Date): string {
  return d.toLocaleDateString("cs-CZ", {
    weekday: "short",
    month: "numeric",
    day: "numeric",
  });
}

function viewTime(d: Date): string {
  return d.toLocaleTimeString("cs-CZ", {
    hour: "numeric",
    minute: "numeric",
  });
}
