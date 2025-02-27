import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { ChatCompletion } from "openai/src/resources/index.js";

export function useContextManager() {
  const messages: ChatCompletionMessageParam[] = [];

  const addChatCompletionMessage = (completion: ChatCompletion) => {
    messages.push(completion.choices[0].message);
  };

  const addMessageParam = (param: ChatCompletionMessageParam) => {
    messages.push(param);
  };

  return {
    addChatCompletionMessage,
    addMessageParam,
    messages,
  };
}
