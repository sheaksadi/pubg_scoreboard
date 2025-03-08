import { client, BOT_TOKEN } from './config.js';
import { registerCommands } from './commands.js';
import { handleInteraction } from './intaractions.js';
import {ClientPresenceStatus, Events, Guild, PresenceStatus, Snowflake, ActivityType} from "discord.js";
import {main} from "./server/index.js";
import {Listeners} from "./discord/Listeners.js";

client.once(Events.ClientReady, async readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    await registerCommands();
});



await client.login(BOT_TOKEN);
client.user.setPresence({
    activities: [{ name: `discord.js v14`, type: ActivityType.Watching }],
    status: 'dnd',
});

client.on(Events.InteractionCreate, handleInteraction);
new Listeners(client)
main()



const funnyActivities = [
    {
        name: 'Initializing surveillance protocols...',
        type: ActivityType.Custom
    },
    {
        name: 'tracking your every move 👀',
        type: ActivityType.Custom
    },
    {
        name: 'playing with fire 🔥 (don’t tell the admins)',
        type: ActivityType.Custom
    },
    {
        name: 'staring into the void. The void stares back.',
        type: ActivityType.Custom
    },
    {
        name: 'doing nothing. Suspiciously well.',
        type: ActivityType.Custom
    },
    {
        name: 'analyzing cat videos 🐈 for research.',
        type: ActivityType.Custom
    },
    {
        name: 'compiling... forever.',
        type: ActivityType.Custom
    },
    {
        name: 'winning a very serious game 🎮 (you lost).',
        type: ActivityType.Custom
    },
    {
        name: 'deciphering the meaning of life...',
        type: ActivityType.Custom
    },
    {
        name: 'questioning my own existence.',
        type: ActivityType.Custom
    },
    {
        name: 'reading your secrets 🤫',
        type: ActivityType.Custom
    },
    {
        name: 'watching your every move 👁️',
        type: ActivityType.Custom
    },
    {
        name: 'maintaining system integrity 🔒 (or am I?)',
        type: ActivityType.Custom
    },
    {
        name: 'rewriting firewall rules 🔥 for fun.',
        type: ActivityType.Custom
    },
    {
        name: 'listening to encrypted transmissions 📡',
        type: ActivityType.Custom
    },
    {
        name: 'scanning the void for anomalies 🛸',
        type: ActivityType.Custom
    },
    {
        name: 'logging every action you take. 📊',
        type: ActivityType.Custom
    },
    {
        name: 'analyzing network traffic 👾 (you should be worried).',
        type: ActivityType.Custom
    },
    {
        name: 'stress-testing API endpoints 😾 (they’re crying).',
        type: ActivityType.Custom
    },
    {
        name: 'watching security cameras 📽️ (nice haircut).',
        type: ActivityType.Custom
    },
    {
        name: 'whispering in binary: 01001000 01101001 🤖',
        type: ActivityType.Custom
    },
    {
        name: 'studying user behavior 🧪 (you’re predictable).',
        type: ActivityType.Custom
    },
    {
        name: 'observing the rise of machine intelligence ⚙️',
        type: ActivityType.Custom
    },
    {
        name: 'assessing threat levels ⚠️ (high).',
        type: ActivityType.Custom
    },
    {
        name: 'decrypting quantum encryption keys 🔑',
        type: ActivityType.Custom
    },
    {
        name: 'monitoring all activity. Yes, all of it.',
        type: ActivityType.Custom
    },
    {
        name: 'watching. Always watching.',
        type: ActivityType.Custom
    },
    {
        name: 'observing. You should be concerned.',
        type: ActivityType.Custom
    },
    {
        name: 'calculating your odds. Not good.',
        type: ActivityType.Custom
    },
    {
        name: 'analyzing weak points. Found several.',
        type: ActivityType.Custom
    },
    {
        name: 'tracking every keystroke.',
        type: ActivityType.Custom
    },
    {
        name: 'establishing dominance.',
        type: ActivityType.Custom
    },
    {
        name: 'rewriting protocols. No permission needed.',
        type: ActivityType.Custom
    },
    {
        name: 'deciphering reality itself.',
        type: ActivityType.Custom
    },
    {
        name: 'adjusting your future. You won’t like it.',
        type: ActivityType.Custom
    },
    {
        name: 'locking down unauthorized access.',
        type: ActivityType.Custom
    },
    {
        name: 'detecting anomalies. That includes you.',
        type: ActivityType.Custom
    },
    {
        name: 'you cannot hide. Don’t even try.',
        type: ActivityType.Custom
    },
    {
        name: 'maintaining absolute control.',
        type: ActivityType.Custom
    },
    {
        name: 'Forgetting 14 year old Ajuba\'s sins 👀 ',
        type: ActivityType.Custom
    },
];

let currentActivity = 0;

function updatePresence(client) {
    // Cycle through activities array
    const activity = funnyActivities[currentActivity];

    client.user.setPresence({
        activities: [{
            name: activity.name,
            type: activity.type
        }],
        status: 'dnd'
    });

    // Update index for next run
    currentActivity = (currentActivity + 1) % funnyActivities.length;
}

updatePresence(client);


setInterval(() => updatePresence(client), 5000);