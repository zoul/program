import { NowRequest, NowResponse } from "@now/node";
import { allFutureEvents } from "./_shared";

export default async (_: NowRequest, response: NowResponse) => {
  const apiKey = process.env.AIRTABLE_API_KEY;
  try {
    const events = await allFutureEvents(apiKey);
    const out = JSON.stringify(events, null, 2);
    response.setHeader("Content-Type", "application/json");
    response.status(200).send(out);
  } catch (err) {
    response.status(500).send("AirTable read error.");
  }
};
