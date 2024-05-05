import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "make sure you take this context in considerations:\ncontext:{context}",
  ],
  ["system", "make sure you take this role in consideration:\nrole:{role}"],
  [
    "system",
    "Answer the user query. use markdown format compatible with obsidian, use ## for h2 and ### for h3,do not use h1, dont write a conclution h2",
  ],
  [
    "human",
    `Using the given title and summary as inspiration, generate a blog post section that expands on the topic. 
    This section should include at least 2 paragraphs of content that provide valuable insights, examples, or tips related to the topic.

*Title:* {title}
**Summary:** {summary}
**Keywords:** {keywords}`,
  ],
]);

export default prompt;
