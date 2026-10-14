#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ==========================================
// 1. Create an MCP Server instance
// ==========================================
const server = new McpServer({
  name: "hello-mcp",
  version: "1.0.0",
});

// ==========================================
// 2. Expose a Tool
// ==========================================
// A tool has:
// - A name: unique identifier
// - A description: helps the LLM decide WHEN to call it
// - Parameter schema: defined with Zod (auto-converted to JSON Schema)
// - Handler function: runs when the LLM triggers the tool
server.tool(
  "say_hello",
  "Generate a friendly greeting in various languages",
  {
    name: z.string().describe("The name of the person to greet"),
    language: z
      .enum(["en", "es", "fr", "de", "ja"])
      .optional()
      .default("en")
      .describe("Language code for the greeting: en (English), es (Spanish), fr (French), de (German), ja (Japanese)"),
  },
  async ({ name, language }) => {
    const greetings: Record<string, string> = {
      en: `Hello, ${name}! Welcome to the Model Context Protocol.`,
      es: `¡Hola, ${name}! Bienvenido al Model Context Protocol.`,
      fr: `Bonjour, ${name}! Bienvenue dans le Model Context Protocol.`,
      de: `Hallo, ${name}! Willkommen beim Model Context Protocol.`,
      ja: `こんにちは、${name}さん！Model Context Protocolへようこそ。`,
    };

    const text = greetings[language] ?? greetings.en;

    return {
      content: [
        {
          type: "text",
          text,
        },
      ],
    };
  }
);

// Another practical tool: calculate BMI
server.tool(
  "calculate_bmi",
  "Calculate Body Mass Index (BMI) and health category given weight and height",
  {
    weightKg: z.number().positive().describe("Weight in kilograms (e.g. 70)"),
    heightM: z.number().positive().describe("Height in meters (e.g. 1.75)"),
  },
  async ({ weightKg, heightM }) => {
    const bmi = weightKg / (heightM * heightM);
    let category = "Normal weight";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi >= 25 && bmi < 30) category = "Overweight";
    else if (bmi >= 30) category = "Obese";

    return {
      content: [
        {
          type: "text",
          text: `BMI: ${bmi.toFixed(2)} (${category}) for weight=${weightKg}kg, height=${heightM}m`,
        },
      ],
    };
  }
);

// ==========================================
// 3. Connect via Standard I/O Transport (stdio)
// ==========================================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // NOTE: Never use console.log! stdout is reserved for JSON-RPC messages.
  // Use console.error for diagnostics and debugging logs.
  console.error("hello-mcp server started and listening on stdio.");
}

main().catch((err) => {
  console.error("Fatal server error:", err);
  process.exit(1);
});
