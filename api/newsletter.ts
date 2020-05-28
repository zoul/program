import { NowRequest, NowResponse } from "@now/node";
import { allFutureEvents, Event } from "./_shared";

export default async (_: NowRequest, response: NowResponse) => {
  const apiKey = process.env.AIRTABLE_API_KEY;
  try {
    const events = await allFutureEvents(apiKey);
    response.setHeader("Content-Type", "text/html; charset=UTF-8");
    response.status(200).send(
      events
        // TODO: Handle date-less events
        .filter((e) => e.datumPresne != null)
        .map(viewEvent)
        .join("\n")
    );
  } catch (err) {
    response.status(500).send("AirTable read error.");
  }
};

function viewEvent(event: Event): string {
  return [
    viewEventTitle(event),
    viewEventSubtitle(event),
    viewEventInfo(event),
  ].join("\n");
}

function viewEventInfo(event: Event): string {
  return `<p>${event.info}</p>`;
}

function viewEventTitle(event: Event): string {
  if (event.fb != null) {
    return `<h2><a href="${event.fb}">${event.jmeno}</a></h2>`;
  } else {
    return `<h2>${event.jmeno}</h2>`;
  }
}

function viewEventSubtitle(event: Event): string {
  const date = event.datumPresne;
  var items = [viewDate(date), viewTime(date)];
  if (event.vstupenky) {
    items.push(`<a href="${event.vstupenky}">vstupenky</a>`);
  }
  return `
  <p style="text-transform: uppercase">
    ${items.join("  //  ")}
  </p>`;
}

function viewDate(d: Date): string {
  return d.toLocaleDateString("cs-CZ", {
    weekday: "long",
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
