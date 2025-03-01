// mock code

import { useOpenAI } from "./compositions/useOpenAI.js";
import { useTools } from "./compositions/useTools.js";

const openai = useOpenAI();
const tools = useTools();

const test = await openai.TestEmbedding(
  {
    information:
      "The user's CPU Specs are: Ryzen 7 5800X3D, RTX 4070 with 12GB of VRAM, 64GB of RAM.",
    metaData: {
      type: "hardware",
    },
  },
  {
    information: "Where is hawaii?",
  }
);
console.log("Test response: ", JSON.stringify(test));

/*

const response = await openai.Prompt({
  tools: tools,
  question:
    "Can you convert 56.23€ to $ for me? And once you have done that, can you convert $60 to euro please.",
  keepUsingTools: false,
});

console.log(response);
*/
