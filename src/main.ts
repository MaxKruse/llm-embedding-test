import inquirer from "inquirer";
import { useLMStudio } from "./compositions/useLMStudio.js";
import { SetRootDir } from "./compositions/useConfig.js";

SetRootDir(process.argv.length == 3 ? process.argv[2] : undefined);

const lmStudio = await useLMStudio();

function exitFunc() {
  console.log("\nExiting gracefully...");
  process.exit(0);
}

process.on("SIGINT", exitFunc);

while (true) {
  const input = await inquirer
    .prompt([
      {
        type: "input",
        name: "chat_input",
        message: "Chat with the AI Agent: >",
      },
    ])
    .catch((e) => exitFunc());

  if (input?.chat_input === undefined) {
    break;
  }

  const resp = await lmStudio.act({ input: input.chat_input });
  console.log(resp + "\n\n");
}
