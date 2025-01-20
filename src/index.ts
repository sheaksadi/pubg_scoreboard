import axios from "axios";
import dotenv from 'dotenv';
dotenv.config({path: "../.env"});

import {
    Client,
    Events,
    GatewayIntentBits,
    GuildTextBasedChannel,
    REST,
    Routes,
    SlashCommandBuilder
} from "discord.js";

const webhookUrl = process.env.WEBHOOK_URL;
const BotToken = process.env.DISCORD_TOKEN;

async function getData(matchId: string): Promise<MatchData> {
    const options = {
        method: 'GET',
        url: 'https://api.pubg.com/shards/steam/matches/' + matchId,
        headers: {Accept: 'application/vnd.api+json'}
    };

    let res = await axios.request(options)
    let data: MatchData = res.data

    return data
}

function getTeams(data: MatchData): Team[] {
    console.time("getTeams")
    console.dir(data.data, {depth: null})

    let rosters = data.included.filter(item => item.type === 'roster')
    let participants = data.included.filter(item => item.type === 'participant')


    let teams: Team[] = [];

    for (let roster of rosters) {
        let rosterRelationships = roster.relationships

        let players: TeamMember[] = []

        for (let p of rosterRelationships.participants.data) {
            let participantData = participants.find(item => item.id === p.id)
            if (participantData) {
                let mvpScore = calculateMVPScore(participantData, roster.attributes.stats.rank, data.data.attributes.duration, rosters.length)
                players.push({...participantData, MVPScore: mvpScore})
            }
        }

        teams.push({
            ...roster,
            players
        })

    }
    console.timeEnd("getTeams")
    return teams
}

function calculateMVP(data: MatchData): Participant {
    let participants = data.included.filter(item => item.type === 'participant')
    let rosters = data.included.filter(item => item.type === 'roster')
    let MVP: Participant | null = null
    let MVPScore = 0
    for (let participant of participants) {
        let mvpScore = calculateMVPScore(participant, participant.attributes.stats.winPlace, data.data.attributes.duration, rosters.length)
        if (MVP === null || mvpScore > MVPScore) {
            MVP = participant
            MVPScore = mvpScore
        }

    }
    return MVP
}

function calculateMVPScore(player: Participant, teamRank: number, matchDuration: number, totalTeams: number): number {
    const {kills, assists, damageDealt, timeSurvived} = player.attributes.stats;

    const W_k = 3;  // Weight for kills
    const W_a = 1;  // Weight for assists
    const W_d = 0.01;  // Weight for damage
    const W_s = 0.5;  // Weight for survival
    const W_r = 10;  // Weight for rank bonus


    // normalize time survived
    const timeSurvivedNormalized = timeSurvived / matchDuration;

    // rank value between 0 and 1
    const rankBonus = Math.max(0, (totalTeams - teamRank + 1) / totalTeams);

    return (
        W_k * kills +
        W_a * assists +
        W_d * damageDealt +
        W_s * timeSurvivedNormalized +
        W_r * rankBonus
    );
}

async function sendAllTeamsToDiscord(teams: Team[], webhookUrl: string, MVP: Participant | null) {
    const sortedTeams = teams.sort(
        (a: Team, b: Team) => a.attributes.stats.rank - b.attributes.stats.rank
    );

    const embeds = sortedTeams.map((team, index) => {
        let totalKills = 0;
        const playerFields = team.players.map((player: TeamMember) => {
            const stats = player.attributes.stats;
            totalKills += stats.kills;
            let name = stats.name;
            name += MVP.id === player.id ? "  (👑MVP)" : "";

            return {
                name: name,
                value: `Kills: ${stats.kills}\nDamage: ${stats.damageDealt}\nAssists: ${stats.assists}`,
                inline: true,
            };
        });


        let color = 0x00FFFF;
        if (index === 0) {
            color = 0xFF0000;
        } else if (index === 1) {
            color = 0xFFA500;
        } else if (index === 2) {
            color = 0xFFFF00;

        }

        return {
            title: `Team #${index + 1} - Rank: ${team.attributes.stats.rank}`,
            description: `${
                team.attributes.won === "true" ? "🏆 Winner!\n" : ""
            }**Total Kills:** ${totalKills}`,
            fields: playerFields.length > 0 ? playerFields : [{
                name: "No Players",
                value: "This team has no players.",
                inline: true
            }],
            color: color,

        };
    });

    // Split embeds into chunks of 10 (Discord has a limit of 10 embeds per message)
    const chunkSize = 10;
    for (let i = 0; i < embeds.length; i += chunkSize) {
        const embedChunk = embeds.slice(i, i + chunkSize);

        // Prepare the payload for Discord
        const payload = {
            username: "PUBG Match Stats",
            embeds: embedChunk,
            avatar_url: process.env.DISCORD_AVATAR
        };

        try {
            // Send the message to Discord
            await axios.post(webhookUrl, payload);
            console.log(`Successfully sent teams ${i + 1}-${i + embedChunk.length} to Discord!`);
        } catch (error) {
            console.error("Error sending webhook message:", error);
        }
    }
}


async function sendToDiscord(matchId: string) {
    let data = await getData(matchId)
    let teams = getTeams(data)
    let MVP = calculateMVP(data)
    await sendAllTeamsToDiscord(teams, webhookUrl, MVP)
}


// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent

    ]
});


client.once(Events.ClientReady, async readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    await registerCommands();

});

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;


})


const subscribeCommand = new SlashCommandBuilder()
    .setName('subscribe')
    .setDescription('Subscribe to updates with your name')
    .addStringOption(option =>
        option.setName('name')
            .setDescription('Your name for the subscription')
            .setRequired(true)
    );
const getLastByNameCommand = new SlashCommandBuilder()
    .setName('get')
    .setDescription('get last custom match with your name')
    .addStringOption(option =>
        option.setName('name')
            .setDescription('Your name to get')
            .setRequired(true)
    );
const getLastByMatchId = new SlashCommandBuilder()
    .setName('get_id')
    .setDescription('get last custom match with id')
    .addStringOption(option =>
        option.setName('id')
            .setDescription('Your id to get')
            .setRequired(true)
    );

const unsubscribeCommand = new SlashCommandBuilder()
    .setName('unsubscribe')
    .setDescription('Unsubscribe from updates');


const rest = new REST({version: '10'}).setToken(BotToken);

async function registerCommands() {
    try {
        console.log('Started refreshing application (/) commands.');

        let commands = await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            {body: [subscribeCommand.toJSON(), unsubscribeCommand.toJSON(), getLastByNameCommand.toJSON(), getLastByMatchId.toJSON()]}
        );

        console.log('Commands registered:', commands);


        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

let lastCustomGameId = null
let lastMatchTime: Date | null = null

let intervalId: NodeJS.Timeout | null = null;

let subscriptionChannel: GuildTextBasedChannel | null = null



async function subscribe(name: string) {

    clearInterval(intervalId)
    intervalId = null


    let subscribedTime = new Date(Date.now())
    lastMatchTime = new Date(Date.now())
    intervalId = setInterval(async () => {

        const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;

        if (Date.now() - lastMatchTime.getTime() > TWO_HOURS_IN_MS) {
            clearInterval(intervalId)
            intervalId = null
            if (subscriptionChannel){
                subscriptionChannel.send("Auto unsubscribed due to inactivity")
            }
            return
        }
        let matches = await getLastMatches(name)

        try {
            let matchData: MatchData = await getData(matches[0]["id"])

            let matchId = matchData.data.id
            console.log("last game id", matchId)

            if (matchData.data.attributes.matchType === 'custom') {

                let matchTime = new Date(matchData.data.attributes.createdAt);
                matchTime.setSeconds(matchTime.getSeconds() + matchData.data.attributes.duration);

                console.log(matchTime);

                if (matchTime.getTime() < subscribedTime.getTime()) {
                    console.log("last match time is before subscribed time")

                    return
                }


                if (lastCustomGameId !== matchId) {
                    lastCustomGameId = matchId
                    lastMatchTime = new Date(Date.now())
                    await sendToDiscord(matchId)
                    console.log(matchId, "send to discord")
                }

            }
        }catch (e){
            console.log("error")
        }


    }, 30000);
}

async function unsubscribe() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        lastCustomGameId = null
    }
}


client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    try {
        switch (interaction.commandName) {
            case 'subscribe':
                const name = interaction.options.getString('name');
                subscriptionChannel = interaction.channel
                try {
                    await subscribe(name);
                }finally {
                    await interaction.reply({
                        content: `✅ Successfully subscribed ${name} for custom games!`,
                        ephemeral: true
                    });
                }
                break;

            case 'unsubscribe':

                await unsubscribe()

                await interaction.reply({
                    content: `✅ Successfully unsubscribed from updates!`,
                    ephemeral: true
                });
                break;
            case 'get':
                const playerName = interaction.options.getString('name');
                try {
                    let lastMatches = await getLastMatches(playerName, 15)
                    await interaction.reply({
                        content: `Trying to get last custom game in last 15 matches for ${playerName}`,
                        ephemeral: true
                    });
                    let matchId = await getLastCustomGame(lastMatches)
                    console.log(matchId, "last matches")
                    if (!matchId) {
                        await interaction.reply({
                            content: `❌ No custom game found in last 15 matches for ${playerName}`,
                            ephemeral: true
                        });
                        return
                    }
                    try {
                        await sendToDiscord(matchId)
                    } catch (e) {
                        await interaction.reply({
                            content: `❌ Failed to send to discord`,
                            ephemeral: true
                        });

                        console.log(e)
                    }
                } catch (e) {
                    await interaction.reply({
                        content: `❌ Failed to get last custom game id`,
                        ephemeral: true
                    });
                }
                break
            case 'get_id':
                const matchId = interaction.options.getString('id');
                try {
                    await interaction.reply({
                        content: `Trying to get last custom game from id`,
                        ephemeral: true
                    });
                    await sendToDiscord(matchId)
                }catch (e) {

                }
        }
    } catch (error) {
        console.error('Error:', error);
        await interaction.reply({
            content: '❌ There was an error processing your request.',
            ephemeral: true
        });
    }
});


client.login(BotToken).then()

async function getLastMatches(playerName: string, count: number = 1): Promise<string[]> {
    const API_KEY = process.env.PUBG_API_KEY;


    const api = axios.create({
        baseURL: 'https://api.pubg.com/shards/',
        headers: {
            'Authorization': `Bearer ${API_KEY.trim()}`,
            'Accept': 'application/vnd.api+json'
        }
    });


    async function getPlayerData(playerName: string) {
        try {
            const response = await api.get('steam/players', {
                params: {
                    'filter[playerNames]': playerName
                }
            });

            return response.data;
        } catch (error) {

        }
    }

    let data = await getPlayerData(playerName)

    // console.log(data.data[0].relationships.matches)
    let matches = data.data[0].relationships.matches

    matches = matches.data.slice(0, count)

    return matches
}

async function getLastCustomGame(matches: any): Promise<string> {
    console.log("matches")
    for await (let match of matches) {
        const matchId = match.id
        try {
            const options = {
                method: 'GET',
                url: 'https://api.pubg.com/shards/steam/matches/' + matchId,
                headers: {Accept: 'application/vnd.api+json'}
            };

            let res = await axios.request(options)
            let data: MatchData = res.data

            if (data.data.attributes.matchType === 'custom') {
                console.log(matchId)
                return matchId
            }
        }catch (e){
            console.log(`failed to get match id ${matchId}`)
        }

    }

}

type Team = Roster & {
    players: TeamMember[]
};
type TeamMember = Participant & {
    MVPScore: number
}
type MatchData = {
    data: {
        type: "match";
        id: string;
        attributes: MatchAttributes;
        relationships: MatchRelationships;
        links: MatchLinks;
    };
    included: IncludedEntity[];
};

type MatchAttributes = {
    createdAt: string;
    stats: null;
    shardId: string;
    mapName: string;
    isCustomMatch: boolean;
    matchType: string;
    seasonState: string;
    duration: number;
    gameMode: string;
    titleId: string;
    tags: null;
};

type MatchRelationships = {
    rosters: {
        data: RosterData[];
    };
    assets: {
        data: AssetData[];
    };
};

type RosterData = {
    type: "roster";
    id: string;
};

type AssetData = {
    type: "asset";
    id: string;
};

type MatchLinks = {
    self: string;
    schema: string;
};

type IncludedEntity =
    | Participant
    | Roster
    | Asset
    | {
    type: "team";
    id: string;
};

type Participant = {
    type: "participant";
    id: string;
    attributes: {
        actor: string;
        shardId: string;
        stats: ParticipantStats;
    };
};
type Asset = {
    type: "asset";
    id: string;
    attributes: {
        name: string;
        description: string;
        createdAt: string;
        URL: string;
    };
};
type ParticipantStats = {
    DBNOs: number;
    assists: number;
    boosts: number;
    damageDealt: number;
    deathType: string;
    headshotKills: number;
    heals: number;
    killPlace: number;
    killStreaks: number;
    kills: number;
    longestKill: number;
    name: string;
    playerId: string;
    revives: number;
    rideDistance: number;
    roadKills: number;
    swimDistance: number;
    teamKills: number;
    timeSurvived: number;
    vehicleDestroys: number;
    walkDistance: number;
    weaponsAcquired: number;
    winPlace: number;
};

type Roster = {
    type: "roster";
    id: string;
    attributes: RosterAttributes;
    relationships: RosterRelationships;
};

type RosterAttributes = {
    stats: {
        rank: number;
        teamId: number;
    };
    won: string;
    shardId: string;
};

type RosterRelationships = {
    team: {
        data: null;
    };
    participants: {
        data: ParticipantReference[];
    };
};

type ParticipantReference = {
    type: "participant";
    id: string;
};
