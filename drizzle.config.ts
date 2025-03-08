import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './src/db/migrations', // Output directory for migrations
    schema: './src/db/schema.ts', // Path to your schema file
    dialect: 'postgresql', // Use PostgreSQL dialect
    dbCredentials: {
        host: process.env.DB_HOST!, // PostgreSQL host (e.g., localhost)
        port: parseInt(process.env.DB_PORT!), // PostgreSQL port (e.g., 5555)
        user: process.env.DB_USER!, // PostgreSQL user (e.g., sadi)
        password: process.env.DB_PASSWORD!, // PostgreSQL password (e.g., sadi12345)
        database: process.env.DB_NAME!, // PostgreSQL database name (e.g., test)
        ssl: false
    },
});