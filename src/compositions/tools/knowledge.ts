import OpenAI from "openai";
import { AddEmbeddingParams, useChromaDB } from "../useChromaDB.js";
import { Metadata } from "chromadb";

export interface KnowledgeIndexConfig {
  information: string;
  metaData?: Metadata;
}

export interface RetrievedKnowledge {
  information: string;
}

export async function IndexKnowledgeTool(
  config: KnowledgeIndexConfig,
  openaiClient: OpenAI
): Promise<boolean> {
  // todo: chromadb save knowledge as vector

  const chroma = await useChromaDB();
  const embeddingData: AddEmbeddingParams = {
    id: "information",
    data: config.information,
    metadata: config.metaData,
  };

  await chroma!.addEmbedding(embeddingData, openaiClient);

  return true;
}

export async function RetrieveKnowledgeTool(
  config: KnowledgeIndexConfig,
  openaiClient: OpenAI
): Promise<RetrievedKnowledge> {
  // todo: search in chromadb for knowledge based on the config, if we cant find it return false, prompting the llm to save the data with the next tool call.

  const chroma = await useChromaDB();

  const data = await chroma!.searchEmbedding(config, openaiClient);
  return {
    information: data,
  };
}
