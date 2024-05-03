import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "human",
    `based on the given title, section summary and section title,
      generate blogpost content for that blogpost section in at least 2 paragraphs,
      with h2 as section title and possible subsections as h3,
      and using given keywords
      title: {title}, 
      summary: {summary},
      section: {section},
      keywords: {keywords}`,
  ],
]);

export default prompt;
