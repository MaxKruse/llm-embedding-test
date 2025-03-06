import { tool } from "@lmstudio/sdk";
import { execSync } from "child_process";
import { z } from "zod";
import { useLogger } from "../useLogger.js";
import { useConfig } from "../useConfig.js";

const GIT_DIFF_COMMAND = "git --no-pager diff --minimal";

export const GitDiffTool = tool({
  name: "git_diff",
  description:
    "Runs git diff to get all outstanding changes in the current directory",
  parameters: {},
  implementation: () => {
    return execSync(GIT_DIFF_COMMAND, {
      encoding: "utf-8",
      cwd: useConfig().RootDir,
    });
  },
});

const GIT_ADD_COMMAND = "git add .";
const GIT_COMMIT_COMMAND = 'git commit -m "{message}" -m "{description}"';

export const GitCommitTool = tool({
  name: "git_commit",
  description:
    "Commits the changes in the current git repository and writes a helpful commit message about what changed. Use the git_diff tool to get information about the changes. Always add a description that includes all changed parts.",
  parameters: {
    commit_message_header: z
      .string()
      .max(72)
      .describe("The broad overview summarization of what changed"),
    commit_message_description: z
      .string()
      .describe("Bulletpoints of what changed for what reason"),
  },
  implementation: ({ commit_message_header, commit_message_description }) => {
    const commitCmd = GIT_COMMIT_COMMAND.replace(
      "{message}",
      commit_message_header
    ).replace("{description}", commit_message_description);

    useLogger().debug("[GitCommitTool] Commit message:", commitCmd);

    execSync(GIT_ADD_COMMAND, { encoding: "utf-8", cwd: useConfig().RootDir });
    execSync(commitCmd, { encoding: "utf-8", cwd: useConfig().RootDir });

    return { status: "Successfully commited changes", commitCmd };
  },
});

const GIT_STATUS = "git status";
export const GitStatusTool = tool({
  name: "git_status",
  description:
    "Gets the current status of the git repository. Should generally be used before git commit and git push.",
  parameters: {},
  implementation: () => {
    return execSync(GIT_STATUS, {
      encoding: "utf-8",
      cwd: useConfig().RootDir,
    });
  },
});

const GIT_PUSH = "git push";
export const GitPushTool = tool({
  name: "git_push",
  description:
    "Pushes currently commited, but not yet pushed changes with git. This should always be followed up by another git status.",
  parameters: {},
  implementation: () => {
    return execSync(GIT_PUSH, { encoding: "utf-8", cwd: useConfig().RootDir });
  },
});
