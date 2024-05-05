import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "make sure you take this context in considerations:\ncontext:{context}",
  ],
  ["system", "make sure you take this role in consideration:\nrole:{role}"],

  [
    "system",
    "Answer the user query. Wrap the output in `json` tags\n{format_instructions}",
  ],
  [
    "human",
    "based on the given title, generate blogpost summary, single word tags and a set og keywords for SEO in json format, title: {title}, reponse:",
  ],
]);

export default prompt;
