// mock code
import { useOpenAI } from "./compositions/useOpenAI.js";
import { useTools } from "./compositions/useTools.js";

const openai = useOpenAI();

const add = false;

const args = process.argv.slice(2);

if (args.length == 0 || args[0] == "add") {
  await openai.AddTestEmbedding({
    information: "The user's CPU Specs are: Ryzen 7 5800X3D.",
    metaData: {
      type: "hardware",
    },
  });

  await openai.AddTestEmbedding({
    information: "The user's RAM Specs are: 64GB of DDR4.",
    metaData: {
      type: "hardware",
    },
  });

  await openai.AddTestEmbedding({
    information: "The user's GPU Specs are: RTX 4070 12GB.",
    metaData: {
      type: "hardware",
    },
  });

  await openai.AddTestEmbedding({
    information: "The user uses typescript, golang, java, c++.",
    metaData: {
      type: "software",
    },
  });

  await openai.AddTestEmbedding({
    information: "The user uses krita for image editing.",
    metaData: {
      type: "software",
    },
  });

  await openai.AddTestEmbedding({
    information: "The user uses OBS Studio to livestream.",
    metaData: {
      type: "software",
    },
  });

  await openai.AddTestEmbedding({
    information: "The user uses Google Chrome to browse the web.",
    metaData: {
      type: "software",
    },
  });

  await openai.AddTestEmbedding({
    information: "The user uses VSCode to edit code.",
    metaData: {
      type: "software",
    },
  });

  await openai.AddTestEmbedding({
    information: "The user uses LMStudio for local LLM Work.",
    metaData: {
      type: "software",
    },
  });

  await openai.AddTestEmbedding({
    information: "The user uses Windows 11.",
    metaData: {
      type: "software",
    },
  });

  await openai.AddTestEmbedding({
    information: "The user streams on Twitch.tv.",
    metaData: {
      type: "software",
    },
  });

  await openai.AddTestEmbedding({
    information: "The user plays balatro, a roguelike card game.",
    metaData: {
      type: "games",
    },
  });

  await openai.AddTestEmbedding({
    information: "The user plays osu!, a rhythm game.",
    metaData: {
      type: "games",
    },
  });

  await openai.AddTestEmbedding({
    information: "The user plays Captain of Industry, a city builder game.",
    metaData: {
      type: "games",
    },
  });

  await openai.AddTestEmbedding({
    information: "The user plays Helldivers 2, an extraction shooter game.",
    metaData: {
      type: "games",
    },
  });

  await openai.AddTestEmbedding({
    information: "The user plays Brotato, an indie roguelike game.",
    metaData: {
      type: "games",
    },
  });

  await openai.AddTestEmbedding({
    information: "The user plays Farlight 84, a battle royale game.",
    metaData: {
      type: "games",
    },
  });

  console.log("All embedded");
} else {
  const response = await openai.SearchTestEmbedding({
    information: "The user uses a software to livestream.",
  });

  console.log(response);
}

/*

const tools = useTools();
const response = await openai.Prompt({
  tools: tools,
  question:
    "Can you convert 56.23€ to $ for me? And once you have done that, can you convert $60 to euro please.",
  keepUsingTools: false,
});

console.log(response);
*/
