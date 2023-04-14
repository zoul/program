import {
  array,
  boolean,
  date,
  field,
  literal,
  nullable,
  number,
  record,
  string,
} from "typescript-json-decoder";

//
// Property Decoders
//

export const urlProp = record({
  type: literal("url"),
  value: field("url", nullable(string)),
});

export const checkboxProp = record({
  type: literal("checkbox"),
  value: field("checkbox", boolean),
});

export const dateProp = record({
  type: literal("date"),
  date: nullable(
    record({
      start: nullable(date),
      end: nullable(date),
    })
  ),
});

export const numberProp = record({
  type: literal("number"),
  value: field("number", nullable(number)),
});

export const selectProp = record({
  type: literal("select"),
  select: nullable(
    record({
      name: nullable(string),
    })
  ),
});

export const richTextProp = record({
  type: literal("rich_text"),
  value: field(
    "rich_text",
    array(
      record({
        type: literal("text"),
        plainText: field("plain_text", string),
      })
    )
  ),
});

export const titleProp = record({
  type: literal("title"),
  value: field(
    "title",
    array(
      record({
        type: literal("text"),
        plainText: field("plain_text", string),
      })
    )
  ),
});
