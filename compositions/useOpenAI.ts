import { configDotenv } from "dotenv";
import OpenAI from "openai";
import { CompletionUsage } from "openai/resources/completions.mjs";
import {
  ChatCompletion,
  ChatCompletionMessageParam,
} from "openai/resources/index.mjs";
import "../util/env";
import { ChatCompletionTool } from "openai/src/resources/index.js";

configDotenv();

const openai = new OpenAI({
  baseURL: process.env.OPENAI_ENDPOINT,
  apiKey: "lm-studio",
});

const SYSTEM_MESSAGE_KEEP_USING_TOOLS =
  "You are a helpful assistant that utilizes tools as they become apparent to help the user with their questions. You always prefer to use tools to process queries than to do your own thinking or math on the topic at hand. You have the ability to solve intermediate steps with little to no tools, but you are always able to use tools at a later point." as const;

const SYSTEM_MESSAGE_DONT_KEEP_USING_TOOLS =
  "You are a helpful assistant that utilizes tools to help the user with their questions. You always prefer to use tools to process queries than to do your own thinking or math on the topic at hand. Once you cannot give more help without more tool usage, inform the user of your intermediate success and wait for a response." as const;

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

function buildMessages(
  config: PromptConfig
): Array<ChatCompletionMessageParam> {
  const messages: Array<ChatCompletionMessageParam> = [];

  // add system message depending on config

  if (config.keepUsingTools) {
    messages.push({
      role: "system",
      content: SYSTEM_MESSAGE_KEEP_USING_TOOLS,
    });
  } else {
    messages.push({
      role: "system",
      content: SYSTEM_MESSAGE_DONT_KEEP_USING_TOOLS,
    });
  }

  // add user question
  messages.push({
    role: "user",
    content: config.question,
  });

  return messages;
}

async function reuseContextRepeatTools(
  firstResponse: ChatCompletion,
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
  const Prompt = async (config: PromptConfig): Promise<PromptResult> => {
    // build the messages
    const messages = buildMessages(config);
    const id = generateID();

    const firstResponse = await openai.chat.completions.create({
      messages: messages,
      model: process.env.OPENAI_LLM_MODEL,
      tools: config.tools,
    });

    // todo: error checks

    if (!config.keepUsingTools) {
      // early return
      return {
        id: id,
        stats: firstResponse.usage!,
        question: config.question,
        answer: firstResponse.choices[0].message.content!,
      };
    }

    // TODO loop for tool usage
    const finalResponse = await reuseContextRepeatTools(firstResponse, config);

    return {
      id: id,
      stats: finalResponse.usage!,
      question: config.question,
      answer: finalResponse.choices[0].message.content!,
    };
  };

  return {
    Prompt,
  };
}
