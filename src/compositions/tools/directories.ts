import { tool } from "@lmstudio/sdk";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { useLogger } from "../useLogger.js";

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
    const data = fs.readdirSync(directoryPath, {
      encoding: "utf-8",
      withFileTypes: true,
    });
    useLogger().debug("[DirectoryListTool] listing directory contents", data);

    return data.map((entry) => {
      return {
        isFile: entry.isFile(),
        isDirectory: entry.isDirectory(),
        name: entry.name,
        parentPath: entry.parentPath,
      };
    });
  },
});

export const CurrentDirectoryTool = tool({
  name: "current_directory",
  description:
    "Get the current directory. ALWAYS used before any other file or directory related tools.",
  parameters: {},
  implementation: () => {
    return { currentDirectory: process.cwd() };
  },
});
