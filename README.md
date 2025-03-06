# Project Overview

This project implements an AI assistant named Albedo, designed to solve queries through iterative tool usage. The system leverages LMStudio for language model interactions and ChromaDB for knowledge embedding.

**Key Components:**
- `main.ts`: Entry point that sets up the environment and starts a chat loop with Albedo.
- `useChromaDB.ts`: Manages interactions with ChromaDB for knowledge embedding and retrieval.
- `useLMStudio.ts`: Configures and interacts with LMStudio's language model and embedding services.
- `useLogger.ts`: Sets up logging functionality using winston.
- `useTools.ts`: Aggregates all tools used by the system.

**Additional Information:**
The assistant strictly communicates in English, adheres to specific personality guidelines, safety rules, and operational procedures. It also includes additional information about file and directory usage conventions.

**Note:** Based on performance observations, models like supernova-medius and qwen2.5b-7b-instruct are recommended for instruct tasks.- Arcee-Agent
- QwQ-LCoT-7B-Instruct# Project Overview

This project implements an AI assistant named Albedo, designed to solve queries through iterative tool usage. The system leverages LMStudio for language model interactions and ChromaDB for knowledge embedding.

**Key Components:**
- main.ts: Entry point that sets up the environment and starts a chat loop with Albedo.
- useChromaDB.ts: Manages interactions with ChromaDB for knowledge embedding and retrieval.
- useLMStudio.ts: Configures and interacts with LMStudio's language model and embedding services.
- useLogger.ts: Sets up logging functionality using winston.
- useTools.ts: Aggregates all tools used by the system.

**Additional Information:** The assistant strictly communicates in English, adheres to specific personality guidelines, safety rules, and operational procedures. It also includes additional information about file and directory usage conventions.

**Note:** Based on performance observations, models like supernova-medius and qwen2.5b-7b-instruct are recommended for instruct tasks. Arcee-Agent
and QwQ-LCoT-7B-Instruct are also believed to work great.