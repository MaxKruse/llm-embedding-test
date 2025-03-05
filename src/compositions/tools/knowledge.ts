import { useChromaDB } from "../useChromaDB.js";
import { tool } from "@lmstudio/sdk";
import { z } from "zod";
import { useLogger } from "../useLogger.js";

const InformationCategoryEnum = z.enum([
  "hardware",
  "software",
  "games",
  "personal",
  "hobby",
  "health",
]);

export const LearnNewInformationTool = tool({
  name: "learn_new_information",
  description:
    "Learns a new piece of information by using an embedding model and saving it to a vector database. This always has to come AFTER looking up existing information to avoid duplication. Information has to be stored as 'The user...'",
  parameters: {
    information: z.string(),
    metaData: InformationCategoryEnum,
  },
  implementation: async ({ information, metaData }) => {
    useLogger().debug("[LearnNewInformationTool]", { information, metaData });

    const chroma = await useChromaDB();

    chroma?.addEmbedding({
      data: information,
      metadata: {
        type: metaData,
      },
    });

    return "Learned and Saved new information to vector database.";
  },
});

export const SearchExistingInformationTool = tool({
  name: "search_existing_information",
  description:
    "Searched the vector database for an existing piece of information. This always has to come BEFORE learning new information to avoid duplication. Information has to be searched either by metadata information or 'The user...'",
  parameters: {
    information: z.string(),
    metaData: InformationCategoryEnum,
  },
  implementation: async ({ information, metaData }) => {
    useLogger().debug("[SearchExistingInformationTool]", {
      information,
      metaData,
    });
    const chroma = await useChromaDB();

    const found = await chroma?.searchEmbedding({
      data: information,
      metadata: {
        type: metaData,
      },
    });

    return `#Results:
    
     - ${found?.join("\n - ")}
    `;
  },
});
