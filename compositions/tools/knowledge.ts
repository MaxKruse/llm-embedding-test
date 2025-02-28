export interface KnowledgeIndexConfig {
  information: string;
}

export interface RetrievedKnowledge {
  information: string;
}

export function IndexKnowledgeTool(config: KnowledgeIndexConfig): boolean {
  // todo: chromadb save knowledge as vector

  return true;
}

export function RetrieveKnowledgeTool(config: KnowledgeIndexConfig): boolean {
  // todo: search in chromadb for knowledge based on the config, if we cant find it return false, prompting the llm to save the data with the next tool call.

  return true;
}
