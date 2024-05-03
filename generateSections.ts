import "dotenv/config";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import prompt from "./prompts/generateSectionContent";
import { title, toc } from "./data/blog";

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

  toc.forEach(async (section) => {
    const result = await chain.invoke({
      title,
      summary: section.summary,
      section: section.title,
      keywords: section.keywords.join(", "),
    });

    console.log(result.content);
    console.log("\n\n\n");
  });
}

main();
