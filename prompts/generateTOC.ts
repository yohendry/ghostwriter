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
    `generate blog post table of content (TOC)
    based on the given title and summary
    the TOC should include 3-6 sections that reflect the title and summary of the blog post,
    with all sections in a simple flat json array and add a paragraph summary for each section and keywords,
    title: {title},
    summary: {summary}
    response following the previous formating instructions: `,
  ],
]);

export default prompt;
