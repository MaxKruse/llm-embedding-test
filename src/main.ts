import inquirer from "inquirer";
import { useLMStudio } from "./compositions/useLMStudio.js";
import { useLogger } from "./compositions/useLogger.js";

const lmStudio = await useLMStudio();

while (true) {
  const input = await inquirer.prompt([
    {
      type: "input",
      name: "chat_input",
      message: "Chat with the AI Agent: >",
    },
  ]);

  const resp = await lmStudio.act({ input: input.chat_input });

  useLogger().info(resp.finalMessage);
}
