declare namespace NodeJS {
  export interface ProcessEnv {
    OPENAI_ENDPOINT: string;
    OPENAI_LLM_MODEL: string;
    OPENAI_EMBEDDING_MODEL: string;
  }
}
