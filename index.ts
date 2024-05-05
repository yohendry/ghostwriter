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
import prompts from "prompts";
import ProgressBar from "progress";
import { format } from "date-fns/format";
import path from "path";
import os from "os";
import OpenAI from "openai";

const openai = new OpenAI();

const GENERATE_FOLDER = path.join(os.homedir(), "opt", "generated");

const url = process.env.OLLAMA_URL;
const modelName = process.env.OLLAMA_MODEL;

const CLEAN_STRING_REGX = /[,@:+()]/g;

if (!url) throw new Error("NO OLLAMA_URL env");
if (!modelName) throw new Error("NO OLLAMA_MODEL env");

const model = new ChatOllama({
  baseUrl: url, // Default value
  model: modelName, // Default value
});

type ROLE_KEYS = "salesman" | "technic";
const ROLE_PROMPT: Record<ROLE_KEYS, string> = {
  salesman:
    "As a confident salesperson, craft an assertive postscript that effectively closes the deal",
  technic:
    "As a knowledgeable IT blogger, write a compelling postscript that summarizes the key takeaways and provides actionable next steps for readers.",
};

async function main() {
  const baseSchema = z
    .object({
      title: z.optional(z.string()).describe("Post title"),
      summary: z.optional(z.string()).describe("Post summary"),
      keywords: z.optional(z.array(z.string())).describe("Post keywords"),
      tags: z.optional(z.array(z.string())).describe("Post tags"),
    })
    .describe("Information about the blog post");

  const baseParser = StructuredOutputParser.fromZodSchema(baseSchema);

  const arrayShema = z.array(baseSchema);
  const arrayParser = StructuredOutputParser.fromZodSchema(arrayShema);

  const userResponse = await prompts([
    {
      type: "text",
      name: "title",
      message: "What is the title of the blog post?",
    },
    {
      type: "text",
      name: "context",
      message: "Add aditional context to the blog post",
    },
    {
      type: "select",
      name: "role",
      choices: [
        { title: "Salesman", value: "salesman" },
        { title: "Technic", value: "technic" },
      ],
      message: "Select role of the blog post",
    },
  ]);

  const rolePrompt = ROLE_PROMPT[userResponse.role as ROLE_KEYS];

  // get post title
  const partialedTitlePrompt = await titleGeneratorPromp.partial({
    format_instructions: arrayParser.getFormatInstructions(),
    context: userResponse.context,
    role: rolePrompt,
  });

  const titleChain = partialedTitlePrompt.pipe(model).pipe(arrayParser);

  const bar = new ProgressBar("[:bar :current/:total]\n:section ", {
    total: 100,
    width: 30,
  });
  bar.tick(0, {
    section: "generating titles",
  });

  const titleResult = await titleChain.invoke({
    title: userResponse.title,
  });

  const jsonTitles = titleResult;

  const titleResponse = await prompts([
    {
      name: "titleIndex",
      type: "select",
      choices: jsonTitles.map((item, index) => ({
        title: item.title || "",
        value: index,
      })),
      message: `\n\nSelect title to use`,
    },
  ]);

  const titleIndex = titleResponse.titleIndex;
  const title = jsonTitles[titleIndex];

  if (!fs.existsSync(GENERATE_FOLDER))
    fs.mkdir(GENERATE_FOLDER, (error) => {
      if (error) {
        console.error(error);
        process.exit(1);
      }
    });

  const titleStr = title.title ? title.title : "post title";
  const slugTitle = slug(titleStr);

  const fileName = `${slugTitle}.md`;
  const mdFilePAth = path.join(GENERATE_FOLDER, fileName);

  fs.writeFileSync(mdFilePAth, `# ${titleStr} \n\n`, "utf-8");

  bar.tick(5, {
    section: "generating summary",
  });
  // get post summary

  const partialedSummaryPrompt = await summaryPrompt.partial({
    format_instructions: baseParser.getFormatInstructions(),
    context: userResponse.context,
    role: rolePrompt,
  });

  const summaryChain = partialedSummaryPrompt.pipe(model).pipe(baseParser);

  const summaryResult = await summaryChain.invoke(title);

  fs.appendFileSync(
    mdFilePAth,
    `## TL; DR\n\t${summaryResult.summary} \n\n`,
    "utf-8",
  );
  bar.tick(15, {
    section: "generating table of content",
  });
  // get TOC

  const partialedTocPrompt = await tocPrompt.partial({
    format_instructions: arrayParser.getFormatInstructions(),
    context: userResponse.context,
    role: rolePrompt,
  });

  const tocChain = partialedTocPrompt.pipe(model).pipe(arrayParser);

  const tocResult = await tocChain.invoke(summaryResult);

  fs.writeFile(
    path.join(GENERATE_FOLDER, `${slugTitle}-toc.json`),
    JSON.stringify(tocResult),
    "utf-8",
    (error) => {
      if (error) console.error(error);
    },
  );

  // generate content
  bar.tick(15, { section: `generating content: sync` });

  const tick = (100 - bar.curr) / tocResult.length;

  const partialedContentPrompt = await generateSectionPrompt.partial({
    context: userResponse.context,
    role: rolePrompt,
  });

  const contentChain = partialedContentPrompt.pipe(model);

  const promises = tocResult.map((section) => {
    const promise = contentChain.invoke({
      title: section.title,
      summary: section.summary,
      keywords: section.keywords,
    });

    promise.then(() => {
      bar.tick(tick, {
        section: `generating content: ${section.title?.split("\n").join(" ")}`,
      });
    });

    return promise;
  });

  function printAsYMLItem(str: string = "") {
    return `\n  - ${cleanString(str)}`;
  }

  function cleanString(str: string = "") {
    return str.replace(CLEAN_STRING_REGX, "");
  }

  Promise.all(promises).then(async (results) => {
    const data = fs.readFileSync(mdFilePAth);
    const fd = fs.openSync(mdFilePAth, "w+");

    const documentParams = {
      author: printAsYMLItem("default"),
      title: cleanString(titleStr),
      summary: cleanString(summaryResult.summary),
      created: format(new Date(), "yyyy-MM-dd"),
      tags: summaryResult.tags?.map(printAsYMLItem),
      keywords: summaryResult.keywords?.map(printAsYMLItem),
    };

    type StatusKey = keyof typeof documentParams;

    const documentParamsText = Object.keys(documentParams)
      .map((key) => {
        return `${key}: ${documentParams[key as StatusKey]}`;
      })
      .join("\n");
    const insert = Buffer.from(`---\n${documentParamsText}\n---\n\n`);
    fs.writeSync(fd, insert, 0, insert.length, 0);
    fs.writeSync(fd, data, 0, data.length, insert.length);
    fs.close(fd, (err) => {
      if (err) throw err;
    });
    console.log("\n\n ============ BLOG POST ============\n\n");

    results.forEach((result) => {
      const content = `${result.content}\n\n`;
      fs.appendFileSync(mdFilePAth, content, "utf-8");
    });

    const target = path.join(
      os.homedir(),
      "opt",
      "obsidian",
      "rootstack",
      fileName,
    );
    fs.copyFileSync(mdFilePAth, target);
    const fullFile = fs.readFileSync(mdFilePAth);
    console.log(fullFile.toString());

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `
Generate photorealistic image for a blog post based on the title and a summary.
Title: ${titleStr},
Summary: ${summaryResult.summary}
`,
      n: 1,
      size: "1024x1024",
    });

    console.log(response);
  });

  bar.terminate();
}

main();
