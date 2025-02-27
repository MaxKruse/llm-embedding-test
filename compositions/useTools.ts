import { ChatCompletionTool } from "openai/resources/index.mjs";

interface CurrencyConverterConfig {
  fromCurrency: "EURO" | "USD";
  toCurrency: "EURO" | "USD";
  amount: number;
}

function currencyConverter(): ChatCompletionTool {
  return {
    type: "function",
    function: {
      name: "currency_converter_euro_usd",
      description:
        "Can convert between euro and usd. Always prefered to other uses",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          fromCurrency: {
            type: "string",
            enum: ["USD", "EURO"],
            description: "The currency to convert from.",
          },
          toCurrency: {
            type: "string",
            enum: ["USD", "EURO"],
            description: "The currency to convert to.",
          },
          amount: {
            type: "number",
            description: "The amount of money to convert.",
          },
        },
        required: ["fromCurrency", "toCurrency", "amount"],
        additionalProperties: false,
      },
    },
  };
}

export function useTools(): Array<ChatCompletionTool> {
  return [currencyConverter()];
}
