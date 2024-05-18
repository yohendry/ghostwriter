import { StructuredOutputParser } from "langchain/output_parsers";
import z from "zod";
import { baseSchema } from "./base";

const arraySchema = z.array(baseSchema);
const arrayParser = StructuredOutputParser.fromZodSchema(arraySchema);
type arraySchemaType = z.infer<typeof arraySchema>;

export { arrayParser, arraySchema, type arraySchemaType };
