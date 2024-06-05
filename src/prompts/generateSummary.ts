import { ChatPromptTemplate } from "@langchain/core/prompts";

const baseMessage = `based on the given title,
-  generate blogpost summary 1-2 paragraphs long
-  single word tags and a set of keywords
-  remember the previous formating isntructions 

**title**: `;

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
  ["human", `${baseMessage} {title}.\nreponse:`],
]);

export default prompt;
