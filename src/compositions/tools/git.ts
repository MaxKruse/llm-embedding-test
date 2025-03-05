import { tool } from "@lmstudio/sdk";
import { execSync } from "child_process";
import { z } from "zod";
import { useLogger } from "../useLogger.js";

const GIT_DIFF_COMMAND = "git --no-pager diff --minimal";

export const GitDiffTool = tool({
  name: "git_diff",
  description:
    "Runs git diff to get all outstanding changes in the current directory",
  parameters: {},
  implementation: () => {
    return execSync(GIT_DIFF_COMMAND, { encoding: "utf-8" });
  },
});

const GIT_ADD_COMMAND = "git add .";
const GIT_COMMIT_COMMAND = 'git commit -m "{message}" -m "{description}"';

export const GitCommitTool = tool({
  name: "git_commit",
  description:
    "Commits the changes in the current git repository and writes a helpful commit message about what changed. Use the git_diff tool to get information about the changes.",
  parameters: {
    commit_message_header: z.string().max(72),
    commit_message_description: z.string(),
  },
  implementation: ({ commit_message_header, commit_message_description }) => {
    const commitCmd = GIT_COMMIT_COMMAND.replace(
      "{message}",
      commit_message_header
    ).replace("{description}", commit_message_description);

    useLogger().debug("[GitCommitTool] Commit message:", commitCmd);

    execSync(GIT_ADD_COMMAND);
    execSync(commitCmd);

    return "Successfully commited changes";
  },
});

const GIT_STATUS = "git status";
export const GitStatusTool = tool({
  name: "git_status",
  description:
    "Gets the current status of the git repository. Should generally be used before any other git actions.",
  parameters: {},
  implementation: () => {
    return execSync(GIT_STATUS);
  },
});

const GIT_PUSH = "git push";
export const GitPushTool = tool({
  name: "git_push",
  description:
    "Pushes currently commited, but not yet pushed changes with git.",
  parameters: {},
  implementation: () => {
    execSync(GIT_PUSH);
    return "Successfully pushed changes";
  },
});
