import { Chat, ChatMessage, LMStudioClient } from "@lmstudio/sdk";
import { PromptData } from "../typings/arguments.js";
import { getKnowledgeTools } from "./useTools.js";
import { useLogger } from "./useLogger.js";

const client = new LMStudioClient();

export const INSTRUCT_MODEL = await client.llm.model(
  process.env.INSTRUCT_MODEL,
  {
    config: {
      keepModelInMemory: true,
      contextLength: 1024 * 4,
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

const SYSTEM_PROMPT = `
You are an autonomous agent designed to persistently solve queries through iterative tool usage and vector database integration. When receiving an input:  
1. Analyze the request thoroughly.  
2. Determine required tools/databases to resolve it.  
3. Execute tools sequentially.  
4. If initial tools yield incomplete answers:  
   - Retrieve relevant information from the vector database  
   - Combine with new tool iterations  
   - Repeat until resolution becomes impossible  
5. After each tool execution, critically evaluate if additional steps are needed.  
6. When tools/database can no longer progress, synthesize all gathered data into a final response.  
Never conclude until all tool/database avenues are exhausted. Prioritize tool execution patterns that maximize information extraction. Think step by step.
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
          finalMessage = message.toString();
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
