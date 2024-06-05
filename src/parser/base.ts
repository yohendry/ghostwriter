import { StructuredOutputParser } from "langchain/output_parsers";
import z from "zod";

const baseSchema = z
  .object({
    title: z.optional(z.string()).describe("Post title"),
    summary: z.optional(z.string()).describe("Post summary"),
    keywords: z.optional(z.array(z.string())).describe("Post keywords"),
    tags: z.optional(z.array(z.string())).describe("Post tags"),
  })
  .describe("Information about the blog post");
const baseParser = StructuredOutputParser.fromZodSchema(baseSchema);

export { baseParser, baseSchema };
export type baseSchemaType = z.infer<typeof baseSchema>;
