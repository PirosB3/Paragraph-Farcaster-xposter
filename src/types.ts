import { z } from "zod";


export const EnvironmentSchema = z.object({
    NEYNAR_API_KEY: z.string().uuid(),
    NEYNAR_SIGNER_UUID: z.string().uuid(),
    PARAGRAPH_PUBLICATION_SLUG: z.string(),
    PARAGRAPH_URL: z.string().url(),
    REDIS_URL: z.string(),
    REDIS_KEY: z.string(),
});
