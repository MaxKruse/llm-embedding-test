import { tool } from "@lmstudio/sdk";
import { z } from "zod";
import fs from "fs";

export const ReadFileTool = tool({
  name: "read_file",
  description: "Reads a file's content.",
  parameters: {
    path: z.string().describe("The full file path."),
  },
  implementation: ({ path }) => {
    // check if the file already exists
    if (!fs.existsSync(path)) {
      return `File "${path}" does not exist`;
    }

    return fs.readFileSync(path, { encoding: "utf-8" });
  },
});

export const WriteFileTool = tool({
  name: "wrtie_file",
  description: "Write a file's content completely.",
  parameters: {
    path: z.string().describe("The full file path."),
    data: z.string().describe("The full file content."),
    overwriteContent: z
      .boolean()
      .default(false)
      .describe(
        "Wether to overwrite the file completely. When false, only appends."
      ),
  },
  implementation: ({ path, data, overwriteContent }) => {
    return fs.writeFileSync(path, data, {
      encoding: "utf-8",
      flag: overwriteContent ? "w" : "a",
    });
  },
});
