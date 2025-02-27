import { ChatCompletionTool } from "openai/resources/index.mjs";

export interface CurrencyConverterConfig {
  fromCurrency: "EURO" | "USD";
  toCurrency: "EURO" | "USD";
  amount: number;
}

export function CurrencyConverterTool(config: CurrencyConverterConfig): Number {
  let factor = 1.0;

  if (config.toCurrency == "EURO" && config.fromCurrency == "USD") {
    factor = 0.9;
  }

  if (config.toCurrency == "USD" && config.fromCurrency == "EURO") {
    factor = 1.1;
  }

  return config.amount * factor;
}

export function currencyConverter(): ChatCompletionTool {
  const definition: ChatCompletionTool = {
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

  return definition;
}
