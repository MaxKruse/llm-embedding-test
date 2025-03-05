import { tool } from "@lmstudio/sdk";
import { z } from "zod";
import fs from "fs";
import path from "path";

export const DirectoryListTool = tool({
  name: "list_directory_content",
  description:
    "Lists all files and directories in a given directory. This list respects the content of '.gitignore' and '.dockerignore' files.",
  parameters: {
    directoryPath: z
      .string()
      .describe(
        "The full path of a folder where to find all files and directories."
      ),
  },
  implementation: ({ directoryPath }) => {
    return fs.readdirSync(directoryPath, {
      encoding: "utf-8",
      withFileTypes: true,
    });
  },
});

export const CurrentDirectoryTool = tool({
  name: "current_directory",
  description:
    "Get the current directory. ALWAYS used before any other file or directory related tools.",
  parameters: {},
  implementation: () => {
    return process.cwd();
  },
});
