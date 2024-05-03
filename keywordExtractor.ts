const sections = [
  {
    title: "What is OLLAMA?",
    summary:
      "In this section, we'll introduce you to OLLAMA and its role in natural language processing (NLP). You'll learn what makes OLLAMA unique and how it can be used to create more accurate and engaging conversations. By the end of this section, you'll have a solid understanding of what OLLAMA is and why it's essential for conversational AI.",
  },
  {
    title: "Why Fine-Tuning OLLAMA Matters",
    summary:
      "In this section, we'll explore the importance of fine-tuning OLLAMA for conversational AI. You'll learn how fine-tuning can help you create more accurate and engaging conversations, and why it's crucial for achieving your goals in NLP.",
  },
  {
    title: "Step-by-Step Guide to Fine-Tuning OLLAMA",
    summary:
      "In this section, we'll provide a step-by-step guide on how to fine-tune your OLLAMA model. You'll learn the best practices for preparing your data, selecting the right hyperparameters, and evaluating your results. By the end of this section, you'll have the knowledge and skills needed to fine-tune your own OLLAMA model.",
  },
  {
    title: "Conclusion",
    summary:
      "In this final section, we'll summarize the key takeaways from our post on fine-tuning OLLAMA. You'll learn how to take your conversational AI to the next level by creating more accurate and engaging conversations with OLLAMA.",
  },
];

const title =
  "Take Your Conversational AI to the Next Level: Fine-Tuning OLLAMA";

import "dotenv/config";
import { ChatOllama } from "@langchain/community/chat_models/ollama";

import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "human",
    `based on the given title and summary, generate blogpost keywords to use and returnit in a flat json array
    title: {title},
    summary: {summary}`,
  ],
]);

const url = process.env.OLLAMA_URL;
const modelName = process.env.OLLAMA_MODEL;

if (!url) throw new Error("NO OLLAMA_URL env");
if (!modelName) throw new Error("NO OLLAMA_MODEL env");

const model = new ChatOllama({
  baseUrl: url, // Default value
  model: modelName, // Default value
});

async function main() {
  const chain = prompt.pipe(model);

  sections.forEach(async (section) => {
    const result = await chain.invoke({
      title,
      summary: section.summary,
      section: section.title,
    });

    console.log(result.content);
    console.log("\n\n\n");
  });
}

main();
