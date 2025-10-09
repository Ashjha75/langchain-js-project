import * as searchWeb from "./searchWeb.js";
// import * as googleCalendar from "./googleCalendar.js"; // Uncomment when ready

export const toolRegistry = {
  [searchWeb.schema.function.name]: {
    schema: searchWeb.schema,
    handler: searchWeb.handler,
  },

  // Uncomment when adding new tools
  // [googleCalendar.schema.function.name]: {
  //   schema: googleCalendar.schema,
  //   handler: googleCalendar.handler,
  // },
};

// Export schemas for Groq SDK
export const tools = Object.values(toolRegistry).map(t => t.schema);
