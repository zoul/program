import { NowRequest, NowResponse } from "@now/node";
import Airtable from "airtable";

export default async (_: NowRequest, response: NowResponse) => {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const table = new Airtable({ apiKey }).base("appKjB9jkVXK4YRGJ")("Program");
  try {
    const records = await table.select({ view: "Grid view" }).all();
    const wanted = records
      .map((r) => r.fields)
      .filter((r) => r["Zveřejnit"] === true);
    const out = JSON.stringify(wanted, null, 2);
    response.setHeader("Content-Type", "application/json");
    response.status(200).send(out);
  } catch (err) {
    response.status(500).send("AirTable read error.");
  }
};
