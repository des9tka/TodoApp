import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

dotenv.config();

const pool = new Pool({
    connectionString: dotenv.config().parsed?.DATABASE_URL,
});

const db = drizzle(pool);

async function connectDb() {
    try {
        await pool.connect();
        console.log("Connected to Supbase.");
    } catch (error) {
        console.error("Database connection error:", error);
        throw error;
    }
}

export { connectDb, db };
