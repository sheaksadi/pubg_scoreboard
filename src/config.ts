import dotenv from 'dotenv';
import { Client as DiscordClient, GatewayIntentBits } from 'discord.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

dotenv.config({ path: ".env" });

export const WEBHOOK_URL = process.env.WEBHOOK_URL;
export const BOT_TOKEN = process.env.DISCORD_TOKEN;
export const API_KEY = process.env.PUBG_API_KEY;

export const DISCORD_CONFIG = {
    clientId: process.env.DISCORD_CLIENT_ID || '',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    redirectUri: process.env.DISCORD_REDIRECT_URI || 'http://localhost:3100/api/auth/callback'
}

export const JWT_SECRET = process.env.JWT_SECRET || 'hehesecter420'

// Create Discord client
export const client = new DiscordClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

// Create PostgreSQL connection pool
const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Create a Drizzle instance using the PostgreSQL client
export const db = drizzle(pool);