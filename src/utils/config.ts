import { z } from "zod";

const configSchema = z.object({
  PYTHON_API_BASE_URL: z.string().url(),
});

const getConfig = () => {
  try {
    return configSchema.parse({
      PYTHON_API_BASE_URL: import.meta.env.VITE_PYTHON_API_BASE_URL,
    });
  } catch (error) {
    console.error("Invalid environment configuration:", error);
    throw new Error("Invalid environment configuration");
  }
};

export const config = getConfig();
