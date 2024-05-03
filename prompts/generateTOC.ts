import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Answer the user query. Wrap the output in `json` tags\n{format_instructions}",
  ],
  [
    "human",
    "based on the given title and summary, generate blogpost table of content with all sections in a simple flat json array and add a paragraph summary for each section and keywords, title: {title}, summary: {summary}",
  ],
]);

export default prompt;
