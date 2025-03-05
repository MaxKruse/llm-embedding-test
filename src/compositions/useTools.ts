import {
  LearnNewInformationTool,
  SearchExistingInformationTool,
} from "./tools/knowledge.js";

export function getKnowledgeTools() {
  return [SearchExistingInformationTool, LearnNewInformationTool];
}
