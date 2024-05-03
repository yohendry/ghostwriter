import "dotenv/config";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import titleGeneratorPromp from "./prompts/titleGenerator";
import summaryPrompt from "./prompts/generateSummary";
import tocPrompt from "./prompts/generateTOC";
import generateSectionPrompt from "./prompts/generateSectionContent";

import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";

import fs from "fs";
import { slug } from "./libs/slug";

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

  const jsonTitles = titleResult;

  // TODO: preguntar por seleccionar titulo
  const titleIndex = 0;
  const title = jsonTitles[titleIndex];

  console.log(title);

  if (!fs.existsSync("./generated"))
    fs.mkdir("./generated", (error) => {
      console.error(error);
      process.exit(1);
    });

  await fs.writeFile(
    "./generated/title.json",
    JSON.stringify(title),
    "utf-8",
    (error) => {
      console.error(error);
    },
  );

  const titleStr = title.title ? title.title : "post title";
  const mdFilePAth = `./generated/${slug(titleStr)}.md`;

  await fs.writeFile(mdFilePAth, `# ${titleStr}\n\n`, "utf-8", (error) => {
    console.error(error);
  });
  // get post summary

  const partialedSummaryPrompt = await summaryPrompt.partial({
    format_instructions: baseParser.getFormatInstructions(),
  });

  const summaryChain = partialedSummaryPrompt.pipe(model).pipe(baseParser);

  const summaryResult = await summaryChain.invoke({
    title: title.title,
  });

  console.log(summaryResult);

  await fs.writeFile(
    "./generated/summary.json",
    JSON.stringify(summaryResult),
    "utf-8",
    (error) => {
      console.error(error);
    },
  );

  await fs.appendFile(
    mdFilePAth,
    `## TL;DR\n${summaryResult.summary}\n\n`,
    "utf-8",
    (error) => {
      console.error(error);
    },
  );

  // get TOC

  const partialedTocPrompt = await tocPrompt.partial({
    format_instructions: arrayParser.getFormatInstructions(),
  });

  const tocChain = partialedTocPrompt.pipe(model).pipe(arrayParser);

  const tocResult = await tocChain.invoke(summaryResult);

  console.log(tocResult);

  await fs.writeFile(
    "./generated/toc.json",
    JSON.stringify(tocResult),
    "utf-8",
    (error) => {
      console.error(error);
    },
  );

  // generate content
  //
  const contentChain = generateSectionPrompt.pipe(model);

  tocResult.forEach(async (section) => {
    const result = await contentChain.invoke({
      title: section.title,
      summary: section.summary,
      keywords: section.keywords,
    });

    console.log(result.content);
    console.log("\n\n\n");

    await fs.appendFile(
      mdFilePAth,
      `${result.content}\n\n`,
      "utf-8",
      (error) => {
        console.error(error);
      },
    );
  });
}

main();
