import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Answer the user query. use markdown format compatible with obsidian, use ## for h2 and ### for h3",
  ],
  [
    "human",
    `based on the given title, section summary and keywords,
      generate blog post content for the given section title and summary in at least 2 paragraphs,
      and using given keywords
      title: {title}, 
      summary: {summary},
      keywords: {keywords}`,
  ],
]);

export default prompt;
