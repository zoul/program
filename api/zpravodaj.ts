import { NowRequest, NowResponse } from "@now/node";
import { allFutureEvents, Event } from "./_shared";

export default async (_: NowRequest, response: NowResponse) => {
  const apiKey = process.env.NOTION_API_KEY;
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
  return [
    viewDateLine(event),
    viewTimeLine(event),
    event.jmeno,
    event.info,
    "",
  ].join("\n");
}

function viewDateLine(event: Event): string {
  if (event.datum) {
    return event.datum;
  } else if (event.datumPresne) {
    return viewDate(event.datumPresne);
  } else {
    return "";
  }
}

function viewTimeLine(event: Event): string {
  if (event.datum) {
    return "Prostor";
  } else {
    return `Prostor ${viewTime(event.datumPresne)}`;
  }
}

function viewDate(d: Date): string {
  return d.toLocaleDateString("cs-CZ", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function viewTime(d: Date): string {
  return d.toLocaleTimeString("cs-CZ", {
    hour: "numeric",
    minute: "numeric",
  });
}
