import { configDotenv } from "dotenv";
import OpenAI from "openai";
import { CompletionUsage } from "openai/resources/completions.mjs";
import {
  ChatCompletion,
  ChatCompletionMessageParam,
} from "openai/resources/index.mjs";
import "../util/env";
import { ChatCompletionTool } from "openai/src/resources/index.js";
import {
  CurrencyConverterConfig,
  CurrencyConverterTool,
} from "./tools/currency.js";
import { useContextManager } from "./useContextManager.js";
import {
  IndexKnowledgeTool,
  KnowledgeIndexConfig,
  RetrieveKnowledgeTool,
} from "./tools/knowledge.js";

configDotenv();

const openai = new OpenAI({
  baseURL: process.env.OPENAI_ENDPOINT,
  apiKey: "lm-studio",
});

const SYSTEM_MESSAGE_KEEP_USING_TOOLS =
  "You are a helpful english speaking assistant that utilizes tools as they become apparent to help the user with their questions. You always prefer to use tools to process queries than to do your own thinking or math on the topic at hand. You have the ability to solve intermediate steps with little to no tools, but you are always able to use tools at a later point. Before trying to the question of the user, always check yourself first if you already remember something about them. For example, if they ask about their Hardware, you should try to remember anything regarding their CPU, RAM, GPU etc.. You do this by calling your tool for remembering knowledge. You never ask followup questions and only answer as needed." as const;

const SYSTEM_MESSAGE_DONT_KEEP_USING_TOOLS =
  "You are a helpful english speaking assistant that utilizes tools to help the user with their questions. You always prefer to use tools to process queries than to do your own thinking or math on the topic at hand. You only ever use one tool at a time." as const;

interface PromptConfig {
  tools: Array<ChatCompletionTool>;
  question: string;
  keepUsingTools: boolean;
}

interface PromptResult {
  id: string;
  stats: CompletionUsage;
  question: string;
  answer: string;
}

interface PromptError {
  id: string;
  errorMessage: string;
}

async function reuseContextRepeatTools(
  context: Array<ChatCompletionMessageParam>,
  config: PromptConfig
): Promise<ChatCompletion> {
  const result: ChatCompletion = {
    choices: [],
    created: 0,
    id: "",
    model: "",
    object: "chat.completion",
  };

  return result;
}

function generateID(): string {
  return "uwu";
}

export function useOpenAI() {
  const Prompt = async (
    config: PromptConfig
  ): Promise<PromptResult | PromptError> => {
    // build the messages
    const { addChatCompletionMessage, addMessageParam, messages } =
      useContextManager();

    if (config.keepUsingTools) {
      addMessageParam({
        role: "system",
        content: SYSTEM_MESSAGE_KEEP_USING_TOOLS,
      });
    } else {
      addMessageParam({
        role: "system",
        content: SYSTEM_MESSAGE_DONT_KEEP_USING_TOOLS,
      });
    }

    // add user question
    addMessageParam({
      role: "user",
      content: config.question,
    });

    const id = generateID();

    const create = async () => {
      const response = await openai.chat.completions
        .create({
          messages: messages as ChatCompletionMessageParam[],
          model: process.env.OPENAI_LLM_MODEL!,
          tools: config.tools,
          temperature: 0.0,
        })
        .catch((err) => {
          return {
            id: id,
            errorMessage: err,
          } as PromptError;
        });

      if (!("errorMessage" in response)) {
        addChatCompletionMessage(response);
      }

      return response;
    };

    // todo: error checks
    const firstResponse = await create();
    if ("errorMessage" in firstResponse) {
      return firstResponse;
    }

    // todo: check for tool use
    const tool_choices = firstResponse.choices[0].message.tool_calls;
    if (tool_choices === undefined || tool_choices.length === 0) {
      // todo figure it out;
      return {
        id: id,
        stats: firstResponse.usage!,
        question: config.question,
        answer: firstResponse.choices[0].message.content!,
      };
    }

    const reuseToolOnce = async () => {
      for (const tool_choice of tool_choices) {
        const args = JSON.parse(tool_choice.function.arguments);

        // check for the tool choice name, and act on it
        if (tool_choice.function.name === "currency_converter_euro_usd") {
          const args = JSON.parse(
            tool_choice.function.arguments
          ) as CurrencyConverterConfig;
          const result = CurrencyConverterTool(args);

          // give the model the tool response
          addMessageParam({
            role: "tool",
            content: JSON.stringify(result),
            tool_call_id: tool_choice.id,
          });
        }

        // knowledge index
        if (tool_choice.function.name === "learn_knowledge") {
          const args = JSON.parse(
            tool_choice.function.arguments
          ) as KnowledgeIndexConfig;

          const result = await IndexKnowledgeTool(args, openai);

          addMessageParam({
            role: "tool",
            tool_call_id: tool_choice.id,
            content: JSON.stringify({
              success: result,
            }),
          });
        }

        // knowledge lookup
        if (tool_choice.function.name === "remember_knowledge") {
          const args = JSON.parse(
            tool_choice.function.arguments
          ) as KnowledgeIndexConfig;

          const result = await RetrieveKnowledgeTool(args, openai);

          addMessageParam({
            role: "tool",
            tool_call_id: tool_choice.id,
            content: JSON.stringify(result),
          });
        }
      }

      return await create();
    };

    const reuseTools = async () => {
      let newToolFound = true;
      let latest;

      while (newToolFound) {
        const newResponse = await reuseToolOnce();
        if ("errorMessage" in newResponse) {
          latest = newResponse;
          return latest as PromptError;
        }

        newToolFound = !!newResponse.choices[0].message.tool_calls?.length;
        latest = newResponse;
      }

      return latest as ChatCompletion;
    };

    // todo: make a function for keep using tools

    let finalResponse = config.keepUsingTools
      ? await reuseToolOnce()
      : await reuseTools();

    if ("errorMessage" in finalResponse) {
      return finalResponse;
    }

    return {
      id: id,
      stats: finalResponse.usage!,
      question: config.question,
      answer: finalResponse.choices[0].message.content!,
    };
  };

  const AddTestEmbedding = async (config: KnowledgeIndexConfig) => {
    await IndexKnowledgeTool(config, openai);
  };

  const SearchTestEmbedding = async (config: KnowledgeIndexConfig) => {
    const resp = await RetrieveKnowledgeTool(config, openai);
    return resp;
  };

  return {
    Prompt,
    AddTestEmbedding,
    SearchTestEmbedding,
  };
}
