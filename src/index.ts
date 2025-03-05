import { client, BOT_TOKEN } from './config.js';
import { registerCommands } from './commands.js';
import { handleInteraction } from './intaractions.js';
import {Events} from "discord.js";
import {main} from "./server/index.js";

client.once(Events.ClientReady, async readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    await registerCommands();
});

client.on(Events.InteractionCreate, handleInteraction);

client.login(BOT_TOKEN).then();

client.on('presenceUpdate', (oldPresence, newPresence) => {
    console.log('presenceUpdate');
    // console.dir(oldPresence, {depth: null});
    console.log(newPresence.user.displayName)
    console.dir(newPresence.activities, {depth: null});
});

main()