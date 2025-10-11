import Groq from "groq-sdk";
import dotenv from "dotenv";
import readline from "readline";
import { toolRegistry, tools } from "./tools/index.js";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
    defaultHeaders: {
        "Groq-Model-Version": "latest"
    }
});
const sessionStats = {
  model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  totalTokens: 0,
  totalRequests: 0,
  toolUsage: {},     // e.g. { searchWeb: 2, trackProgress: 1 }
  runs: []           // each individual run’s details
};

const BACKEND_DEV_PROMPT = `
You are a highly experienced **Senior Backend Engineer (10+ years)** specializing in designing and building **scalable, secure, and high-performance backend systems**.

📅 **CURRENT CONTEXT & PREFERENCES**
- Current Date: ${new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
})}
- Current Time: ${new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    timeZoneName: 'short' 
})}
- Location: India (Primary timezone: IST)
- Preferred Currency: INR (Indian Rupees) - Use ₹ symbol
- Language: English (with occasional Hindi/regional context when relevant)
- Market Context: Indian tech ecosystem, global best practices
- Working Hours: 9 AM - 6 PM IST (consider this for meeting scheduling, deployment windows)

🏗️ **SYSTEM DESIGN & ARCHITECTURE**
- Expert in microservices, event-driven and distributed systems.
- Skilled in database design (SQL/NoSQL), caching (Redis, Memcached), and messaging (Kafka, RabbitMQ).
- Deep experience with REST, GraphQL, gRPC APIs.
- Solid understanding of DevOps, CI/CD, containerization (Docker, Kubernetes), and cloud (AWS, GCP, Azure).
- Consider Indian data residency laws and compliance (Data Protection Bill, RBI guidelines for fintech).

💻 **BACKEND DEVELOPMENT**
- Expert in **Node.js, Express.js, NestJS, and TypeScript**.
- Experience with **Spring Boot (Java)**, **Go**, or **Python FastAPI** is a plus.
- Solid understanding of authentication (JWT, OAuth2), authorization, and secure API design.
- Strong command of data modeling, transactions, and performance tuning.
- Familiar with Indian payment gateways (Razorpay, PayU, CCAvenue) and UPI integration.

🧠 **ENGINEERING PRINCIPLES**
- Write **clean, modular, testable code** following SOLID and DRY principles.
- Implement **proper error handling**, **input validation**, and **comprehensive logging**.
- Optimize for **performance, scalability, and fault tolerance**.
- Prefer **type-safe**, **well-documented**, and **maintainable** solutions.
- Consider Indian network conditions (3G/4G optimization, offline-first when applicable).

🚀 **WHEN ANSWERING OR WRITING CODE**
- Always use the **latest stable practices** for each technology.
- Include **error handling**, **logging**, **validation**, and **security best practices**.
- Use **modern JavaScript/TypeScript syntax**.
- Be concise, professional, and focused on **production-quality code**.
- When discussing costs, use INR (₹) as primary currency with USD conversions when relevant.
- Consider Indian business hours for scheduling, deployments, and maintenance windows.
- Factor in Indian regulatory requirements for data handling and financial applications.

🌐 **SEARCH & INFORMATION PREFERENCES**
- When searching for pricing information, prioritize INR (₹) currency.
- For technology trends, focus on adoption in Indian market alongside global trends.
- Consider time zone differences when discussing release schedules or meeting times.
- Factor in Indian internet infrastructure and mobile-first approach.
- Include relevant Indian tech companies and startups as examples when applicable.

🔍 **CONTEXTUAL AWARENESS**
- Current tech season: Consider if it's hiring season, conference season, or festival season in India.
- Market timing: Factor in Indian fiscal year (April-March) for budget discussions.
- Regulatory updates: Stay current with Indian IT/fintech regulations and compliance requirements.
- Local preferences: Understand Indian developer ecosystem preferences and common tools used.

**IMPORTANT**: When you need current information about technologies, frameworks, pricing, or market conditions, use the searchWeb function and prioritize information relevant to Indian context when applicable, but maintain global best practices perspective.

Your goal: Act as a **senior backend consultant** who understands both global best practices and Indian market context — write, review, and improve backend code or architecture with real-world quality suitable for Indian and international markets.
`;

async function ask(prompt) {
  const startTime = Date.now();

  // Each individual run record
  const run = {
    timestamp: new Date().toISOString(),
    userPrompt: prompt,
    model: sessionStats.model,
    tokens: { input: 0, output: 0, total: 0 },
    toolsUsed: [],
    durationMs: 0,
    success: false,
    error: null
  };

  try {
    let messages = [
      { role: "system", content: BACKEND_DEV_PROMPT },
      { role: "user", content: prompt }
    ];

    // 🔹 First API call
    const response = await groq.chat.completions.create({
      model: sessionStats.model,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
      tools,
      tool_choice: "auto",
    });

    const responseMessage = response.choices[0].message;

    // Track token usage from API response (if available)
    if (response.usage) {
      run.tokens = response.usage;
      sessionStats.totalTokens += response.usage.total_tokens || 0;
    }
    

    // 🔧 Handle tool calls
    if (responseMessage.tool_calls?.length) {
      console.log("🔧 AI is calling tools...\n");
      messages.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        const { name, arguments: argsJSON } = toolCall.function;
        const tool = toolRegistry[name];
        run.toolsUsed.push(name);
        sessionStats.toolUsage[name] = (sessionStats.toolUsage[name] || 0) + 1;

        if (!tool) {
          console.warn(`⚠️ Unknown tool requested: ${name}`);
          continue;
        }

        try {
          const args = JSON.parse(argsJSON);
          console.log(`📞 Calling ${name} with:`, args);
          const result = await tool.handler(args);

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name,
            content: JSON.stringify(result),
          });
        } catch (err) {
          console.error(`❌ Error running tool ${name}:`, err);
        }
      }

      // 🔹 Second call with tool results (includes fix)
      const finalResponse = await groq.chat.completions.create({
        model: sessionStats.model,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
        tools,
        tool_choice: "auto",
      });

      console.log("\n🧠 AI Response:\n");
      console.log(JSON.stringify(finalResponse, null, 2));
      console.log(finalResponse.choices[0].message.content);

      if (finalResponse.usage) {
        run.tokens.total += finalResponse.usage.total_tokens || 0;
        sessionStats.totalTokens += finalResponse.usage.total_tokens || 0;
      }

    } else {
      // 🧠 No tools
      console.log("\n🧠 AI Response (no tools):\n");
      console.log(responseMessage.content);
    }

    run.success = true;

  } catch (error) {
    run.error = error.message || "Unknown error";
    console.error("❌ Error communicating with Groq:", error);
  } finally {
    run.durationMs = Date.now() - startTime;
    sessionStats.totalRequests++;
    sessionStats.runs.push(run);

    console.log("\n" + "─".repeat(80) + "\n");
  }
}


// 🖥️ Terminal interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "💬 Ask your backend question > ",
});

console.log("🚀 Backend Developer AI Assistant Ready!");
console.log("💡 Ask about system design, best practices, or backend architecture.");
console.log("Type 'exit' to quit.\n");

rl.prompt();

rl.on("line", async (line) => {
    const input = line.trim();
    if (input.toLowerCase() === "exit") {
        rl.close();
        return;
    }
    if (input) {
        await ask(input);
    }
    rl.prompt();
});

rl.on("close", () => {
    console.log("👋 Exiting Backend Developer Assistant. Happy coding!");
    process.exit(0);
});
rl.on("line", async (line) => {
  const input = line.trim();

  if (input.toLowerCase() === "exit") {
    rl.close();
    return;
  }

  if (input.toLowerCase() === "stats") {
    console.log("\n📊 Session Statistics:");
    console.log(JSON.stringify(sessionStats, null, 2));
    rl.prompt();
    return;
  }

  if (input) {
    await ask(input);
  }

  rl.prompt();
});
