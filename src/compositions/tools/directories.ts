import { tool } from "@lmstudio/sdk";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { useLogger } from "../useLogger.js";
import { useConfig } from "../useConfig.js";

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

    const final = data.map((entry) => {
      return {
        isFile: entry.isFile(),
        isDirectory: entry.isDirectory(),
        name: entry.name,
      };
    });

    useLogger().debug("[DirectoryListTool] listing directory contents", final);

    return final;
  },
});

export const CurrentDirectoryTool = tool({
  name: "current_directory",
  description:
    "Get the current directory. ALWAYS used before any other file, directory or git related tools.",
  parameters: {},
  implementation: () => {
    const config = useConfig();
    let root = process.cwd();
    if (config.RootDir) {
      root = config.RootDir;
    }
    return { currentDirectory: root };
  },
});
