import { AddRecordsParams, ChromaClient, Metadata } from "chromadb";
import { sys } from "typescript";
import { AutoTokenizer } from "@huggingface/transformers";

import "fs";
import { writeFile } from "fs";
import { v4 } from "uuid";
import { EMBEDDING_MODEL } from "./useLMStudio.js";
import { useLogger } from "./useLogger.js";

// values for granite-embedding-278m-multilingual
const MAX_EMBEDDING_TOKENS = 512;
const VECTOR_SIZE = 768;
const MODEL_PATH = "ibm-granite/granite-embedding-278m-multilingual";

const COLLECTION_NAME = "knowledge";

const chromaClient = new ChromaClient();

async function splitKnowledge(
  config: EmbeddingParams
): Promise<Array<EmbeddingParams>> {
  const res: Array<EmbeddingParams> = [];

  const tokenizer = await AutoTokenizer.from_pretrained(MODEL_PATH);

  const sentence_embedding = await tokenizer.encode(config.data);
  useLogger().debug("Sentence embedding size", sentence_embedding.length);

  if (sentence_embedding.length > MAX_EMBEDDING_TOKENS) {
    // cut up the knowledge

    const keepSplitting = async (conf: EmbeddingParams) => {
      const new_embedding = await tokenizer.encode(config.data);

      useLogger().debug(
        "Got new embedding size for the split part",
        new_embedding.length
      );

      if (new_embedding.length <= MAX_EMBEDDING_TOKENS) {
        res.push(conf);
        return;
      }

      const newParts: Array<EmbeddingParams> = [];

      const splits = conf.data.split(".");
      for (const part of splits) {
        newParts.push({
          data: part,
          metadata: conf.metadata,
          id: v4(),
        });
      }

      for (const newPart of newParts) {
        await keepSplitting(newPart);
      }
    };

    await keepSplitting(config);
  } else {
    res.push(config);
  }

  return res;
}

export interface EmbeddingParams {
  id?: string;
  data: string;
  metadata: Metadata;
}

export async function useChromaDB() {
  const res = await chromaClient.heartbeat().catch((err: Error) => err);

  if (res instanceof Error) {
    useLogger().error("Error connecting to chromaDB", res);
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

  const addEmbedding = async (params: EmbeddingParams) => {
    const allParts = await splitKnowledge(params);

    for (const part of allParts) {
      // get embedding from openai
      const embeddingData = await EMBEDDING_MODEL.embed(part.data);

      const chromaData: AddRecordsParams = {
        ids: [part.id ?? v4()],
        documents: [part.data],
        embeddings: [embeddingData.embedding],
      };

      if (part.metadata) {
        chromaData.metadatas = [part.metadata];
      }

      await collection.add(chromaData);
    }
  };

  const searchEmbedding = async (
    config: EmbeddingParams
  ): Promise<Array<string>> => {
    const embeddingData = await EMBEDDING_MODEL.embed(config.data);

    const queried = await collection.query({
      nResults: 10,
      // @ts-ignore
      includes: ["documents", "distances"],
      queryEmbeddings: [embeddingData.embedding],
      where: {
        type: {
          $eq: config.metadata["type"] || "",
        },
      },
    });

    await writeFile(
      "queried.json",
      JSON.stringify(queried, null, 2),
      {},
      () => {}
    );

    let resultStrings: Array<string> = [];

    // find the lowest distance, and return the document with that index
    if (queried.documents) {
      for (let i = 0; i < queried.ids.length; i++) {
        const currentSearchIds = queried.ids.at(i);
        const currentSearchDistances = queried.distances!.at(i);
        const currentSearchDocuments = queried.documents!.at(i);

        for (let j = 0; j < currentSearchIds!.length; j++) {
          const currentId = currentSearchIds?.at(j);
          const currentDistance = currentSearchDistances?.at(j)!;
          const currentDocument = currentSearchDocuments?.at(j)!;

          const tempString = `Information retrieved with ${(
            (1.0 - currentDistance) *
            100
          ).toFixed(2)}% Confidence: ${currentDocument}`;

          resultStrings.push(tempString);
        }
      }
    }

    return resultStrings;
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
