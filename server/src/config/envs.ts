import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().transform((port) => parseInt(port, 10)),
  FRONTEND_URL: z.string(),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
});

const envServer = envSchema.safeParse({
  PORT: process.env.PORT,
  FRONTEND_URL: process.env.FRONTEND_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
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
