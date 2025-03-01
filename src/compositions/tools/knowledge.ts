import OpenAI from "openai";
import { AddEmbeddingParams, useChromaDB } from "../useChromaDB.js";
import { Metadata } from "chromadb";
import { v4 as uuidv4 } from "uuid";
import { ChatCompletionTool } from "openai/resources/index.mjs";

export interface KnowledgeIndexConfig {
  information: string;
  metaData?: Metadata;
}

export interface RetrievedKnowledge {
  information: Array<string>;
}

export async function IndexKnowledgeTool(
  config: KnowledgeIndexConfig,
  openaiClient: OpenAI
): Promise<boolean> {
  // todo: chromadb save knowledge as vector

  const chroma = await useChromaDB();
  const embeddingData: AddEmbeddingParams = {
    id: uuidv4(),
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
  console.log("Looking for data:", config.information);

  const data = await chroma!.searchEmbedding(config, openaiClient);
  console.log("Found data:", data);
  return {
    information: data,
  };
}

export function knowledge(): Array<ChatCompletionTool> {
  const tools: Array<ChatCompletionTool> = [];

  tools.push({
    type: "function",
    function: {
      name: "remember_knowledge",
      description:
        "Remembers a previously learned piece of information about the user. This has to be used before learning something new. Always.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          information: {
            type: "string",
            description: "The piece of information to remember about the user.",
          },
        },
        required: ["information"],
        additionalProperties: false,
      },
    },
  });

  tools.push({
    type: "function",
    function: {
      name: "learn_knowledge",
      description: "Learns a new piece of information about the user.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          information: {
            type: "string",
            description: "The piece of information to learn about the user.",
          },
          metaData: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["hardware", "software", "games"],
              },
            },
          },
        },
        required: ["information"],
        additionalProperties: false,
      },
    },
  });

  return tools;
}
