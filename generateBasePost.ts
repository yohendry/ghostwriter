import "dotenv/config";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import prompt from "./prompts/generateSummary";
import { title } from "./data/blog";

const url = process.env.OLLAMA_URL;
const modelName = process.env.OLLAMA_MODEL;

if (!url) throw new Error("NO OLLAMA_URL env");
if (!modelName) throw new Error("NO OLLAMA_MODEL env");

const model = new ChatOllama({
  baseUrl: url, // Default value
  model: modelName, // Default value
});

async function main() {
  const chain = prompt.pipe(model);

  const result = await chain.invoke({
    title,
  });

  console.log(result.content);
}

main();
