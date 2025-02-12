import { client, BOT_TOKEN } from './config.js';
import { registerCommands } from './commands.js';
import { handleInteraction } from './intaractions.js';
import {Events} from "discord.js";

client.once(Events.ClientReady, async readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    await registerCommands();
});

client.on(Events.InteractionCreate, handleInteraction);

client.login(BOT_TOKEN).then();