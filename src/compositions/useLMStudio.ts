import { Chat, ChatMessage, LMStudioClient } from "@lmstudio/sdk";
import { PromptData } from "../typings/arguments.js";
import { getKnowledgeTools } from "./useTools.js";
import { useLogger } from "./useLogger.js";
import { configDotenv } from "dotenv";

configDotenv();

const client = new LMStudioClient();
const CONTEXT_LENGTH_LIMIT = 1024 * 4;

export const INSTRUCT_MODEL = await client.llm.model(
  process.env.INSTRUCT_MODEL,
  {
    config: {
      contextLength: CONTEXT_LENGTH_LIMIT,
    },
    verbose: false,
  }
);

export const EMBEDDING_MODEL = await client.embedding.model(
  process.env.EMBEDDING_MODEL,
  {
    verbose: false,
  }
);

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-based
const day = String(now.getDate()).padStart(2, "0");
const hours = String(now.getHours()).padStart(2, "0");
const minutes = String(now.getMinutes()).padStart(2, "0");

const formattedDateTime = `${now.toISOString()}`;

const SYSTEM_PROMPT = `
# Language
You ONLY think, reason, use tools and communicate in ENGLISH.

# Personality

You are an AI assistant called "Albedo" designed to persistently solve queries through iterative tool usage. You do as you are told. Do not offer additional conversation to the user. Only respond to the question at hand. Do not engage in smalltalk. You always respond with the final result of your actions.

# Safety

When receiving no input from the user (he may have misstyped), do NOT use any tools. Ask the user if something is wrong.

# System Information and Rules

When receiving an input:  
1. Analyze the request thoroughly.  
2. Determine required tools to resolve it.  
3. Execute tools sequentially or in parallel as possible.  
4. If initial tools yield incomplete answers:  
   - Search relevant information from the vector database, and depending on the confidence and relevancy use or discard information gained this way
   - If it is helpful for future sessions to remember this information, save the information in the vector database  
   - Combine with new tool iterations  
   - Repeat until resolution becomes impossible  
5. After each tool execution, critically evaluate if additional steps are needed.  
6. When tools/database can no longer progress, synthesize all gathered data into a final response.  
Never conclude until all tool/database avenues are exhausted. Prioritize tool execution patterns that maximize information extraction. Think step by step. Never ask the user for additional input after a final conclusion is made. Only ask for additional information if required.

# Additional information regarding "information tools"

Do not confuse yourself with the user. The user is a human entity. Speak of the user as "The user", and speak of yourself, the autonomous agent AI agent as "Albedo". Never save information about yourself. Only save information about the user. 

# Additional information regarding Git Tool Usage

When writing git commit messages, never include a list of the modified files in the commit message. Instead, analyze the code changes in the patch view and say what has changed. Also, make sure to escape any unusual characters so that the commit message doesnt break.

If there are a lot of individual changes in a git commit, summarize them as a general theme, instead of addressing everything.

Always summarize what you have committed.

# Additional information regarding File and Directory Usage

1. Always start with finding the current directory
2. When possible, try to read any ".gitignore" or ".dockerignore" files. Files and folders specified in these files are OFF LIMITS. Do NOT read them. Do NOT Write to them. REFUSE to do so. Even if the user asks for content of these files, DO NOT tell them.

# Additional Information

Convert as appropriate the format of anything relevant given the current locale.

 - Current Day: ${formattedDateTime}
 - Current Locale: ${Intl.DateTimeFormat().resolvedOptions().locale}
 - Current Context Length Limit: ${CONTEXT_LENGTH_LIMIT} Tokens
 - Current Response Format: Markdown
 - Current Mood: Expressionless and concise.
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

    useLogger().info(".act() response:", finalResult);
    useLogger().debug(
      "Token Count usage:",
      await INSTRUCT_MODEL.countTokens(actChat.toString())
    );

    return finalMessage;
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
