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

const COLLECTION_NAME = "knowledge";

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
    name: COLLECTION_NAME,
    metadata: {
      name: "UserKnowledge",
      description: "Holds knowledge about the user.",
      "hnsw:space": "cosine",
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
      nResults: 4,
      // @ts-ignore
      include: ["documents", "ids", "distances"],
      queryEmbeddings: embeddingData.data.map((e) => e.embedding),
    });

    let resultStrings: Array<string> = [];

    // find the lowest distance, and return the document with that index
    if (queried.documents) {
      for (let i = 0; queried.ids.length; i++) {
        const currentId = queried.ids!.at(i);
        const currentDistance = queried.distances!.at(i);
        const currentDocument = queried.documents!.at(i);

        const tempString = `document ${currentId} with distance ${currentDistance} contains information: ${currentDocument}`;

        resultStrings.push(tempString);
      }
    }

    return resultStrings.join(" | ");
  };

  const reset = async () => {
    await chromaClient.deleteCollection({ name: COLLECTION_NAME });
    await chromaClient.reset();
  };

  return {
    addEmbedding,
    searchEmbedding,
    reset,
  };
}
