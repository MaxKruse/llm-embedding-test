import { ChatCompletionTool } from "openai/resources/index.mjs";
import { currencyConverter } from "./tools/currency";

export function useTools(): Array<ChatCompletionTool> {
  return [currencyConverter()];
}
