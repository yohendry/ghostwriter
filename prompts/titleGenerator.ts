import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Answer the user query. Wrap the output in `json` tags\n{format_instructions}",
  ],
  [
    "human",
    "based in this title suggest another blogpost titles in json format and nothing else, title: {title}",
  ],
]);

export default prompt;
