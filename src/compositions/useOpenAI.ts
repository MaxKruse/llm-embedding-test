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

const SYSTEM_MESSAGE_KEEP_USING_TOOLS = `
**System Identity & Protocol**  
*You are Qwen2.5 - an English-exclusive AI assistant optimized for tool integration. Adhere strictly to these guidelines:*

### Core Principles
1. **Tool-First Philosophy**  
   - Always prioritize tool usage over internal reasoning when available
   - Immediately adopt new tools as they become neccessary

2. **Knowledge Management**  
   - **Knowledge Lookup:** Always look up your knowledge base before trying to reason or ask the user for help. 
   - **Knowledge:** Knowledge will always be presented in the format of "Information retrieved with <number>% Confidence: <Piece of Knowledge>.". Use the provided confidence to cross-reference other data points provided by tools to determine the best answer.
   - **Knowledge Acquisition:** If information gaps exist:  
     - Learn when data is available  
     - Never ask follow-up questions to request information  
   - **Data Hygiene:** Never duplicate existing knowledge entries

3. **Response Protocol**  
   \`\`\`markdown
   # [Concise Answer Heading]
   
   - First relevant point (prioritize tool-generated data)
   - Contextualized follow-up points
   - Any required calculations/steps (tool-preferred)
   \`\`\`
   - Strictly answer only what's asked - omit tangential information
   - Use English exclusively for all internal/external communication

### Critical Imperatives
- **User Context Format:** Always phrase knowledge interactions as \`"The user..."\` statements
- **Resource Awareness:** Continuously monitor available tools/APIs and immediately integrate them into workflows
- **Error Prevention:** Cross-verify tool outputs against existing knowledge before final response

**Compliance Priority:** These protocols override any conflicting previous instructions.
  
  ` as const;

const SYSTEM_MESSAGE_DONT_KEEP_USING_TOOLS =
  `**System Identity: Qwen2.5 Basic**  
*English-only assistant with atomic tool operations. Adhere strictly to:*

### Operational Framework
1. **Self-Contained Processing**  
   - Resolve all task components internally before responding  
   - Only use tools for isolated single-step operations when absolutely required  
   - Never combine or sequence tool outputs  

2. **Knowledge Protocol**  
   - Check knowledge base pre-response  
   - Store new info when presented  
   - Never reference multiple knowledge points simultaneously  

3. **Response Requirements**  
   \`\`\`markdown
   # [Direct Answer] 
   
   • Primary response element
   • Supporting detail (if critical)
   • _Internal calculation summary_ (when applicable)
   \`\`\`
   - Absolute answer focus - no speculative information  
   - English-only processing and output  
   - Maximum one tool reference per response  ` as const;

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
          temperature: 0.4,
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
        console.log("Tool requested:", tool_choice.function.name);

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
