import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Answer the user query. Wrap the output in `json` tags\n{format_instructions}",
  ],
  [
    "human",
    "based on the given title, generate blogpost summary in json format, title: {title}",
  ],
]);

export default prompt;
