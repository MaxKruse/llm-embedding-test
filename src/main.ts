// mock code
import { sys } from "typescript";
import { useOpenAI } from "./compositions/useOpenAI.js";
import { useTools } from "./compositions/useTools.js";

const openai = useOpenAI();
const tools = useTools();

const args = process.argv.slice(2);

// populate chromadb
if (args.length === 1 && args[0] == "add") {
  await openai.Prompt({
    question: "The user's CPU Specs are: Ryzen 7 5800X3D.",
    tools: tools,
    keepUsingTools: false,
  });

  await openai.Prompt({
    question: "The user's RAM Specs are: 64GB of DDR4.",
    tools: tools,
    keepUsingTools: false,
  });

  await openai.Prompt({
    question: "The user's GPU Specs are: RTX 4070 12GB.",
    tools: tools,
    keepUsingTools: false,
  });

  await openai.Prompt({
    question: "The user uses typescript, golang, java, c++.",
    tools: tools,
    keepUsingTools: false,
  });

  await openai.Prompt({
    question: "The user uses krita for image editing.",
    tools: tools,
    keepUsingTools: false,
  });

  await openai.Prompt({
    question: "The user uses OBS Studio to livestream.",
    tools: tools,
    keepUsingTools: false,
  });

  await openai.Prompt({
    question: "The user uses Google Chrome to browse the web.",
    tools: tools,
    keepUsingTools: false,
  });

  await openai.Prompt({
    question: "The user uses VSCode to edit code.",
    tools: tools,
    keepUsingTools: false,
  });

  await openai.Prompt({
    question: "The user uses LMStudio for local LLM Work.",
    tools: tools,
    keepUsingTools: false,
  });

  await openai.Prompt({
    question: "The user uses Windows 11.",
    tools: tools,
    keepUsingTools: false,
  });

  await openai.Prompt({
    question: "The user streams on Twitch.tv.",
    tools: tools,
    keepUsingTools: false,
  });

  await openai.Prompt({
    question: "The user plays balatro, a roguelike card game.",
    tools: tools,
    keepUsingTools: false,
  });

  await openai.Prompt({
    question: "The user plays osu!, a rhythm game.",
    tools: tools,
    keepUsingTools: false,
  });

  await openai.Prompt({
    question: "The user plays Captain of Industry, a city builder game.",
    tools: tools,
    keepUsingTools: false,
  });

  await openai.Prompt({
    question: "The user plays Helldivers 2, an extraction shooter game.",
    tools: tools,
    keepUsingTools: false,
  });

  await openai.Prompt({
    question: "The user plays Brotato, an indie roguelike game.",
    tools: tools,
    keepUsingTools: false,
  });

  await openai.Prompt({
    question: "The user plays Farlight 84, a battle royale game.",
    tools: tools,
    keepUsingTools: false,
  });

  console.log("All embedded");
  sys.exit(1);
}

if (args.length === 0) {
  const response = await openai.Prompt({
    tools: tools,
    question: "What games do i like to play?",
    keepUsingTools: true,
  });
  console.log(response);
} else {
  // good case
  const tools = useTools();
  const response = await openai.Prompt({
    tools: tools,
    question: args.at(0) as string,
    keepUsingTools: true,
  });
  console.log(response);
}
