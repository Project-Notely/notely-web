import { z } from "zod";

const configSchema = z.object({
  REACT_APP_API_BASE_URL: z.string().url(),
});

const getConfig = () => {
  try {
    return configSchema.parse({
      REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
    });
  } catch (error) {
    console.error("Invalid environment configuration:", error);
    throw new Error("Invalid environment configuration");
  }
};

export const config = getConfig();
