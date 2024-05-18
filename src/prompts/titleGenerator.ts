import { ChatPromptTemplate } from '@langchain/core/prompts';

const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'make sure you take this context in considerations:\ncontext:{context}'],

  ['system', 'make sure you take this role in consideration:\nrole:{role}'],
  ['system', 'Answer the user query. Wrap the output in `json` tags\n{format_instructions}'],
  [
    'human',
    `I'd like you to take the following short text as inspiration and generate 5-7 unique blog post title ideas
    following the previous format instructions.
    The text is: {title},
    response:`,
  ],
]);

export default prompt;
