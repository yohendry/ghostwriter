import type prompts from "prompts";
import type { arraySchemaType } from "../parser/array";

export const PROMPT_USER_CHOICES: prompts.PromptObject<
  "title" | "context" | "role"
>[] = [
    {
      type: "text",
      name: "title",
      message: "What is the title of the blog post?",
    },
    {
      type: "text",
      name: "context",
      message: "Add aditional context to the blog post",
    },
    {
      type: "select",
      name: "role",
      choices: [
        { title: "Salesman", value: "salesman" },
        { title: "Technic", value: "technic" },
      ],
      message: "Select role of the blog post",
    },
  ];

export function getTitleChoisePrompt(titles: arraySchemaType) {
  return [
    {
      name: "titleIndex",
      type: "select",
      choices: titles.map((item, index) => ({
        title: item.title || "",
        value: index,
      })),
      message: "Select title to use",
    },
  ] as prompts.PromptObject<"titleIndex">[];
}

export const PROMPT_USER_CHAT_INPUT: prompts.PromptObject<"question">[] = [
  {
    type: "text",
    name: "question",
    message: "ask gw:",
  },
];

export const PROMPT_USER_CHAT_CONTINUE: prompts.PromptObject<"continue">[] = [
  {
    type: "select",
    name: "continue",
    choices: [
      { title: "Yes", value: "yes" },
      { title: "No", value: "no" },
    ],
    message: "Continue chatting?...",
  },
];
