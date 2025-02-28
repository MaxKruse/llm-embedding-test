// mock code

import { useOpenAI } from "./compositions/useOpenAI.js";
import { useTools } from "./compositions/useTools.js";

const openai = useOpenAI();
const tools = useTools();

const response = await openai.Prompt({
  tools: tools,
  question:
    "Can you convert 56.23€ to $ for me? And once you have done that, can you convert $60 to euro please.",
  keepUsingTools: false,
});

console.log(response);
