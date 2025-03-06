# Project Overview

This project implements an AI assistant named Albedo, designed to solve queries through iterative tool usage. The system uses LMStudio for language model interactions and ChromaDB for embedding knowledge.

Key components:

- `main.ts`: Entry point that sets up the environment and starts a chat loop with Albedo.
- `useChromaDB.ts`: Manages interactions with ChromaDB for knowledge embedding and retrieval.
- `useLMStudio.ts`: Configures and interacts with LMStudio's language model and embedding services.
- `useLogger.ts`: Sets up logging functionality using winston.
- `useTools.ts`: Aggregates all tools used by the system.

The assistant strictly communicates in English, adheres to specific personality guidelines, safety rules, and operational procedures. It also includes additional information about file and directory usage conventions.

**Note**: supernova-medius and qwen2.5b-7b-instruct are observed to have the best performance as the instruct models.