import inquirer from "inquirer";
import { useLMStudio } from "./compositions/useLMStudio.js";

const lmStudio = await useLMStudio();

process.on("SIGINT", () => {
  console.log("\nExiting gracefully...");
  process.exit(0);
});

while (true) {
  const input = await inquirer.prompt([
    {
      type: "input",
      name: "chat_input",
      message: "Chat with the AI Agent: >",
    },
  ]);

  const resp = await lmStudio.act({ input: input.chat_input });
  console.log(resp + "\n\n");
}
