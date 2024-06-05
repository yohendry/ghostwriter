import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a chat assistante and will ansewring questions about the recent created blog post in a natural and frienly way",
  ],

  [
    "human",
    `*** question: 
    {question}
    *** response:`,
  ],
]);

export default prompt;
