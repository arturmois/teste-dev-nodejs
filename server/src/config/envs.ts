import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().transform((port) => parseInt(port, 10)),
  CLIENT_URL: z.string(),
  DATABASE_URL: z.string(),
  SESSION_SECRET: z.string().optional(),
});

const envServer = envSchema.safeParse({
  PORT: process.env.PORT,
  CLIENT_URL: process.env.CLIENT_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
});

if (!envServer.success) {
  throw new Error(
    `There is an error with the server environment variables: ${JSON.stringify(
      envServer.error.issues
    )}`
  );
}

const envServerSchema = envServer.data;

export default envServerSchema;
