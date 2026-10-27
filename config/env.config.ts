import dotenv from 'dotenv';
dotenv.config();

import * as z from 'zod';

const EnvConfigSchema = z.object({
    ADMIN_KEY: z.string().min(1, "ADMIN_KEY is required"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
})

const ENV = EnvConfigSchema.parse(process.env);

export default ENV;
export { ENV }