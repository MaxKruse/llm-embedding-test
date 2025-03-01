import { ChatCompletionTool } from "openai/resources/index.mjs";
import { currencyConverter } from "./tools/currency.js";
import { knowledge } from "./tools/knowledge.js";

export function useTools(): Array<ChatCompletionTool> {
  return [currencyConverter(), ...knowledge()];
}
