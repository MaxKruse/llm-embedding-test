import {
  AddRecordsParams,
  ChromaClient,
  IncludeEnum,
  Metadata,
} from "chromadb";
import OpenAI from "openai";
import { sys } from "typescript";
import "../util/env.js";
import { Embedding, Embeddings } from "openai/resources/embeddings.mjs";
import { KnowledgeIndexConfig } from "./tools/knowledge.js";

// values for granite-embedding-278m-multilingual
const MAX_EMBEDDING_TOKENS = 512;
const VECTOR_SIZE = 768;

const chromaClient = new ChromaClient();

export interface AddEmbeddingParams {
  id: string;
  data: string;
  metadata?: Metadata;
}

export async function useChromaDB() {
  const res = await chromaClient.heartbeat().catch((err: Error) => err);

  if (res instanceof Error) {
    console.log("Error connecting to chromaDB: ", res);
    sys.exit(1);
    return;
  }

  // ensure collection
  const collection = await chromaClient.getOrCreateCollection({
    name: "knowledge",
    metadata: {
      name: "UserKnowledge",
      description: "Holds knowledge about the user.",
    },
  });

  const addEmbedding = async (
    params: AddEmbeddingParams,
    openaiClient: OpenAI
  ) => {
    // get embedding from openai
    const embeddingData = await openaiClient.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL!,
      input: params.data,
    });

    const chromaData: AddRecordsParams = {
      ids: [params.id],
      documents: [params.data],
      embeddings: embeddingData.data.map((e) => e.embedding),
    };

    if (params.metadata) {
      chromaData.metadatas = [params.metadata];
    }

    await collection.add(chromaData);

    console.log("Added to chroma data: ", JSON.stringify(chromaData));
  };

  const searchEmbedding = async (
    config: KnowledgeIndexConfig,
    openaiClient: OpenAI
  ): Promise<string> => {
    const embeddingData = await openaiClient.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL!,
      input: config.information,
    });

    const queried = await collection.query({
      nResults: 1,
      // @ts-ignore
      include: ["documents"],
      queryEmbeddings: embeddingData.data.map((e) => e.embedding),
    });

    // find the lowest distance, and return the document with that index
    if (queried.documents) {
      return queried.documents.toString();
    }

    return "";
  };

  const reset = async () => {
    await chromaClient.reset();
  };

  return {
    addEmbedding,
    searchEmbedding,
    reset,
  };
}
