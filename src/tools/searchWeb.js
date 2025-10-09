import { tavily } from "@tavily/core";
import dotenv from "dotenv";

dotenv.config();

const searchTool = tavily({
  apiKey: process.env.TAVILY_API_KEY || "",
});

export const schema = {
  type: "function",
  function: {
    name: "searchWeb",
    description: "Search the web for the latest information on technologies, frameworks, or best practices",
    parameters: {
      type: "object",
      properties: {
        searchQuery: {
          type: "string",
          description: "Search query for Tavily to find relevant info"
        }
      },
      required: ["searchQuery"]
    }
  }
};

export async function handler({ searchQuery }) {
  try {
    console.log(`🔍 Searching the web for: ${searchQuery}`);
    const response = await searchTool.search(searchQuery);

    const content = response.results
      .map(r => r.content || r.snippet || "")
      .filter(Boolean)
      .join("\n\n");

    return content || "No search results found";
  } catch (error) {
    console.error("❌ Search error:", error);
    return "Unable to fetch current information";
  }
}
