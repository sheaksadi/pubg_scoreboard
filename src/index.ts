import {client, BOT_TOKEN, DISCORD_GUILD_ID} from './config.js';
import {main} from "./server/index.js";
import {Listeners} from "./discord/Listeners.js";
import {SeasonalTracker} from "./seasonalTracker.js";



await client.login(BOT_TOKEN);

export let guild = await client.guilds.fetch(DISCORD_GUILD_ID)
new Listeners(client)
main()
new SeasonalTracker()
