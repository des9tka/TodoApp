import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config();

export default {
    schema: "./src/config/schema.ts",
    out: "./drizzle/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: dotenv.config().parsed?.DATABASE_URL || "",
    },
    verbose: true,
    strict: true,
} satisfies Config;
