// mock code

import { useOpenAI } from "./compositions/useOpenAI";
import { useTools } from "./compositions/useTools";

const openai = useOpenAI();
const tools = useTools();

const response = await openai.Prompt({
  tools: tools,
  question: "Can you convert 5€ to $5 for me?",
  keepUsingTools: false,
});

console.log(response);
