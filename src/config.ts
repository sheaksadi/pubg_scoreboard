import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

dotenv.config({ path: "../.env" });

export const WEBHOOK_URL = process.env.WEBHOOK_URL;
export const BOT_TOKEN = process.env.DISCORD_TOKEN;
export const API_KEY = process.env.PUBG_API_KEY;

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const sqlite = new Database("./../" + process.env.DB_FILE_NAME!);
console.log("./../" + process.env.DB_FILE_NAME!)
console.log(sqlite)
export const db = drizzle(sqlite);


