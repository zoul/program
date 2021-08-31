import { VercelRequest, VercelResponse } from "@vercel/node";
import { allFutureEvents, Event } from "./_shared";

export default async (_: VercelRequest, response: VercelResponse) => {
  const apiKey = process.env.NOTION_API_KEY;
  try {
    const events = await allFutureEvents(apiKey);
    response.setHeader("Content-Type", "text/html; charset=UTF-8");
    response.status(200).send(
      events
        // TODO: Handle date-less events
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
  var items = event.datum
    ? [event.datum]
    : [viewDate(event.datumPresne), viewTime(event.datumPresne)];
  if (event.vstupenky) {
    items.push(`<a href="${event.vstupenky}">vstupenky</a>`);
  }
  if (event.vstupne) {
    const format = new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: "CZK",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format;
    items.push(`Doporučené vstupné ${format(event.vstupne)}`);
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
