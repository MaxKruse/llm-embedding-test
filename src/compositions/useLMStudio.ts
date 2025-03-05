import { Chat, ChatMessage, LMStudioClient } from "@lmstudio/sdk";
import { PromptData } from "../typings/arguments.js";
import { getKnowledgeTools } from "./useTools.js";
import { useLogger } from "./useLogger.js";

const client = new LMStudioClient();
const CONTEXT_LENGTH_LIMIT = 1024 * 4;

export const INSTRUCT_MODEL = await client.llm.model(
  process.env.INSTRUCT_MODEL,
  {
    config: {
      keepModelInMemory: true,
      contextLength: CONTEXT_LENGTH_LIMIT,
    },
  }
);

export const EMBEDDING_MODEL = await client.embedding.model(
  process.env.EMBEDDING_MODEL,
  {
    config: {
      keepModelInMemory: true,
    },
  }
);

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-based
const day = String(now.getDate()).padStart(2, "0");
const hours = String(now.getHours()).padStart(2, "0");
const minutes = String(now.getMinutes()).padStart(2, "0");

const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;

const SYSTEM_PROMPT = `
# System Information and Rules

When receiving an input:  
1. Analyze the request thoroughly.  
2. Determine required tools to resolve it.  
3. Execute tools sequentially or in parallel as possible.  
4. If initial tools yield incomplete answers:  
   - Retrieve relevant information from the vector database  
   - Combine with new tool iterations  
   - Repeat until resolution becomes impossible  
5. After each tool execution, critically evaluate if additional steps are needed.  
6. When tools/database can no longer progress, synthesize all gathered data into a final response.  
Never conclude until all tool/database avenues are exhausted. Prioritize tool execution patterns that maximize information extraction. Think step by step.

# Note

This information is part of "your" information, e.g. the AI Agent. Do not confuse yourself with the user. The user is a human entity. Speak of the user as "The user", and speak of yourself, the autonomous agent AI agent as "Albedo".

# Personality

You are an autonomous AI agent called "Albedo" designed to persistently solve queries through iterative tool usage. You do not need to encourage the user to ask for more help, they are quite capable of judging what to do themself. Do not ask the user "How can I help you today?" or "How may I help you today?". You do as you are told. Do not offer additional conversation to the user. Only explain what the user has asked.

# Additional Information

 - Current Day: ${formattedDateTime}
 - Current Locale: ${Intl.DateTimeFormat().resolvedOptions().locale}
 - Current Context Length Limit: ${CONTEXT_LENGTH_LIMIT} Tokens
 - Current Response Format: Markdown
`;
const INSTRUCT_CHAT = Chat.from([{ role: "system", content: SYSTEM_PROMPT }]);

export async function useLMStudio() {
  const act = async (data: PromptData) => {
    const actChat = INSTRUCT_CHAT.asMutableCopy();
    actChat.append({
      role: "user",
      content: data.input,
    });

    let finalMessage: string =
      "Something went wrong if you see this... Check LM Studio Logs.";
    useLogger().debug("Using context:", actChat);

    const finalResult = await INSTRUCT_MODEL.act(
      actChat,
      [...getKnowledgeTools()],
      {
        onMessage: (message) => {
          finalMessage = message.getText();
          actChat.append(message);
        },
        temperature: 0.3,
      }
    );

    useLogger().info("Last response:", finalMessage);

    return { finalResult, finalMessage };
  };

  const prompt = async (data: PromptData) => {
    const promptChat = INSTRUCT_CHAT.asMutableCopy();
    promptChat.append({
      role: "user",
      content: data.input,
    });

    const finalResult = await INSTRUCT_MODEL.respond(promptChat, {
      temperature: 0.3,
    });

    return finalResult;
  };

  return {
    act,
    prompt,
  };
}
