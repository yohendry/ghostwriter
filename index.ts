import "dotenv/config";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import titleGeneratorPromp from "./prompts/titleGenerator";
import summaryPrompt from "./prompts/generateSummary";
import tocPrompt from "./prompts/generateTOC";
import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";

const url = process.env.OLLAMA_URL;
const modelName = process.env.OLLAMA_MODEL;

if (!url) throw new Error("NO OLLAMA_URL env");
if (!modelName) throw new Error("NO OLLAMA_MODEL env");

const model = new ChatOllama({
  baseUrl: url, // Default value
  model: modelName, // Default value
});

async function main() {
  const baseSchema = z
    .object({
      title: z.optional(z.string()).describe("Post title"),
      summary: z.optional(z.string()).describe("Post summary"),
      keywords: z.optional(z.array(z.string())).describe("Post keywords"),
    })
    .describe("Information about the blog post");

  const baseParser = StructuredOutputParser.fromZodSchema(baseSchema);

  const arrayShema = z.array(baseSchema);
  const arrayParser = StructuredOutputParser.fromZodSchema(arrayShema);

  // get post title
  const partialedTitlePrompt = await titleGeneratorPromp.partial({
    format_instructions: arrayParser.getFormatInstructions(),
  });

  const titleChain = partialedTitlePrompt.pipe(model).pipe(arrayParser);

  const titleResult = await titleChain.invoke({
    title: "Migrate Drupal 7 to Drupal 10",
  });

  console.log(titleResult);
  const jsonTitles = titleResult;
  console.log(jsonTitles);

  // TODO: preguntar por seleccionar titulo
  const titleIndex = 0;
  const title = jsonTitles[titleIndex];

  console.log(title);

  // get post summary

  const partialedSummaryPrompt = await summaryPrompt.partial({
    format_instructions: baseParser.getFormatInstructions(),
  });

  const summaryChain = partialedSummaryPrompt.pipe(model).pipe(baseParser);

  const summaryResult = await summaryChain.invoke({
    title: title.title,
  });

  console.log(summaryResult);

  // get TOC

  const partialedTocPrompt = await tocPrompt.partial({
    format_instructions: arrayParser.getFormatInstructions(),
  });

  const tocChain = partialedTocPrompt.pipe(model).pipe(arrayParser);

  const tocResult = await tocChain.invoke(summaryResult);

  console.log(tocResult);

  // generate content
}

main();

/*
  Thank you for your question! I'm happy to help. However, I must point out that the phrase "I love programming" is not grammatically correct in German. The word "love" does not have a direct translation in German, and it would be more appropriate to say "I enjoy programming" or "I am passionate about programming."

  In German, you can express your enthusiasm for something like this:

  * Ich möchte Programmieren (I want to program)
  * Ich mag Programmieren (I like to program)
  * Ich bin passioniert über Programmieren (I am passionate about programming)

  I hope this helps! Let me know if you have any other questions.
*/
