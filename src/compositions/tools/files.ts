import { tool } from "@lmstudio/sdk";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { useLogger } from "../useLogger.js";

export const ReadFileTool = tool({
  name: "read_file",
  description:
    "Reads a file's content. Before reading, make sure the file is NOT contained in the contents of a .gitignore file.",
  parameters: {
    filePath: z.string().describe("The full file path."),
  },
  implementation: async ({ filePath }) => {
    useLogger().debug("[ReadFileTool]", { filePath });

    // check if the file already exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File "${filePath}" does not exist`);
    }

    return {
      filename: path.basename(filePath),
      content: fs.readFileSync(filePath, { encoding: "utf-8" }),
    };
  },
});

export const WriteFileTool = tool({
  name: "write_file",
  description: "Write a file's content.",
  parameters: {
    path: z.string().describe("The full file path."),
    data: z.string().describe("The full file content."),
    overwriteContent: z
      .boolean()
      .default(false)
      .describe(
        "Wether to overwrite the file completely. true = overwrite, false = append."
      ),
  },
  implementation: async ({ path, data, overwriteContent }) => {
    fs.writeFileSync(path, data, {
      encoding: "utf-8",
      flag: overwriteContent ? "w" : "a",
    });

    return { status: "success", datawritten: data };
  },
});
