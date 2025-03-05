import {
  GitCommitTool,
  GitDiffTool,
  GitPushTool,
  GitStatusTool,
} from "./tools/git.js";
import {
  LearnNewInformationTool,
  SearchExistingInformationTool,
} from "./tools/knowledge.js";

export function getKnowledgeTools() {
  return [
    SearchExistingInformationTool,
    LearnNewInformationTool,
    GitDiffTool,
    GitCommitTool,
    GitPushTool,
    GitStatusTool,
  ];
}
