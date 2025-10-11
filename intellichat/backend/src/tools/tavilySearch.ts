/**
 * Tavily Web Search Tool
 * Provides web search and browsing capabilities using Tavily API
 */

import axios from "axios";
import { CONFIG } from "../config";
import { logger } from "../utils/logger";

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
}

export interface TavilySearchResponse {
  query: string;
  results: SearchResult[];
  answer?: string;
  images?: string[];
  responseTime: number;
}

export interface SearchOptions {
  query: string;
  searchDepth?: "basic" | "advanced";
  maxResults?: number;
  includeAnswer?: boolean;
  includeImages?: boolean;
  includeDomains?: string[];
  excludeDomains?: string[];
}

class TavilySearchTool {
  private apiKey: string;
  private baseUrl = "https://api.tavily.com";

  constructor() {
    this.apiKey = CONFIG.ai.external.tavily || "";
    if (!this.apiKey) {
      logger.warn("Tavily API key not configured. Web search will be unavailable.");
    }
  }

  /**
   * Check if the tool is enabled and configured
   */
  isEnabled(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  /**
   * Perform a web search using Tavily API
   */
  async search(options: SearchOptions): Promise<TavilySearchResponse> {
    if (!this.isEnabled()) {
      throw new Error("Tavily search is not configured. Please set TAVILY_API_KEY in environment.");
    }

    const startTime = Date.now();

    try {
      logger.info("Performing Tavily web search", {
        query: options.query,
        searchDepth: options.searchDepth || "basic",
        maxResults: options.maxResults || 5,
      });

      const response = await axios.post(
        `${this.baseUrl}/search`,
        {
          api_key: this.apiKey,
          query: options.query,
          search_depth: options.searchDepth || "basic",
          max_results: options.maxResults || 5,
          include_answer: options.includeAnswer !== false,
          include_images: options.includeImages || false,
          include_domains: options.includeDomains || [],
          exclude_domains: options.excludeDomains || [],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        },
      );

      const responseTime = Date.now() - startTime;

      logger.info("Tavily search completed", {
        query: options.query,
        resultsCount: response.data.results?.length || 0,
        responseTime: `${responseTime}ms`,
      });

      return {
        query: options.query,
        results: response.data.results || [],
        answer: response.data.answer,
        images: response.data.images || [],
        responseTime,
      };
    } catch (error: any) {
      logger.error("Tavily search failed", {
        error: error.message,
        query: options.query,
        statusCode: error.response?.status,
      });

      throw new Error(`Web search failed: ${error.message}`);
    }
  }

  /**
   * Format search results for AI context
   */
  formatResultsForAI(searchResponse: TavilySearchResponse): string {
    let formatted = `# Web Search Results for: "${searchResponse.query}"\n\n`;

    if (searchResponse.answer) {
      formatted += `## Quick Answer\n${searchResponse.answer}\n\n`;
    }

    formatted += `## Search Results (${searchResponse.results.length} found)\n\n`;

    searchResponse.results.forEach((result, index) => {
      formatted += `### ${index + 1}. ${result.title}\n`;
      formatted += `**URL:** ${result.url}\n`;
      if (result.publishedDate) {
        formatted += `**Published:** ${result.publishedDate}\n`;
      }
      formatted += `**Relevance:** ${(result.score * 100).toFixed(1)}%\n\n`;
      formatted += `${result.content}\n\n`;
      formatted += "---\n\n";
    });

    formatted += `*Search completed in ${searchResponse.responseTime}ms*\n`;

    return formatted;
  }

  /**
   * Search and format results in one call
   */
  async searchAndFormat(options: SearchOptions): Promise<string> {
    const results = await this.search(options);
    return this.formatResultsForAI(results);
  }

  /**
   * Extract key information from search results
   */
  extractKeyInfo(searchResponse: TavilySearchResponse): {
    summary: string;
    sources: string[];
    topResult: SearchResult | null;
  } {
    const sources = searchResponse.results.map((r) => r.url);
    const topResult = searchResponse.results[0] || null;

    let summary = searchResponse.answer || "";
    if (!summary && searchResponse.results.length > 0) {
      summary = searchResponse.results
        .slice(0, 3)
        .map((r) => r.content.substring(0, 200))
        .join(" ... ");
    }

    return {
      summary,
      sources,
      topResult,
    };
  }
}

// Export singleton instance
export const tavilySearch = new TavilySearchTool();

// Export tool metadata for AI provider integration
export const tavilyToolMetadata = {
  name: "web_search",
  description:
    "Search the web for current information, news, facts, and data. Use this when you need up-to-date information or when the user asks about recent events, current data, or web content.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query to find information on the web",
      },
      searchDepth: {
        type: "string",
        enum: ["basic", "advanced"],
        description: "Search depth: 'basic' for quick results, 'advanced' for comprehensive search",
        default: "basic",
      },
      maxResults: {
        type: "number",
        description: "Maximum number of results to return (1-10)",
        default: 5,
        minimum: 1,
        maximum: 10,
      },
    },
    required: ["query"],
  },
};
