import { Interaction } from 'discord.js';
import {db, WEBHOOK_URL} from './config.js';
import {getData, getPlayerData} from './api.js';
import {sendToDiscord, sendTopPlayersToDiscord} from './discord.js';
import { getLastMatches, getLastCustomGame } from './matches.js';
import {calculateMVP, calculateMVPScore} from "./MVP.js";
import {
    checkPlayerExists,
    createMatch,
    createMatchStats, createPlayer,
    findOrCreateMatch,
    findOrCreatePlayer,
    getTopPlayers,
    resetPlayerTotals
} from "./db/schema.js";
import {MatchData, Team} from "./types.js";

let lastCustomGameId: string | null = null;
let lastMatchTime: Date | null = null;
let intervalId: NodeJS.Timeout | null = null;
let subscriptionChannel: any = null;

async function subscribe(name: string) {
    clearInterval(intervalId);
    intervalId = null;

    let subscribedTime = new Date();
    lastMatchTime = new Date();

    intervalId = setInterval(async () => {
        const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;

        if (Date.now() - lastMatchTime.getTime() > TWO_HOURS_IN_MS) {
            clearInterval(intervalId);
            intervalId = null;
            if (subscriptionChannel) {
                subscriptionChannel.send("Auto unsubscribed due to inactivity");
            }
            return;
        }

        try {
            const matches = await getLastMatches(name);
            const matchData = await getData(matches[0].id);
            const matchId = matchData.data.id;

            if (matchData.data.attributes.matchType === 'custom') {
                let matchTime = new Date(matchData.data.attributes.createdAt);
                matchTime.setSeconds(matchTime.getSeconds() + matchData.data.attributes.duration);

                if (matchTime.getTime() < subscribedTime.getTime()) {
                    return;
                }

                if (lastCustomGameId !== matchId) {
                    lastCustomGameId = matchId;
                    lastMatchTime = new Date();
                    await sendDataToDiscord(matchId);
                    await updateDB(matchId);
                }
            }
        } catch (error) {
            console.error('Error in subscription interval:', error);
        }
    }, 30000);
}

async function unsubscribe() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        lastCustomGameId = null;
    }
}

async function updateDB(matchId: string) {
    const data = await getData(matchId);
    const teams = getTeams(data);
    // const MVP = calculateMVP(data);
    try {
        await createMatch(db, data.data.id, data.data.attributes.mapName, data.data.attributes.duration);
    } catch (error) {
        console.error("Error creating match:", error);
    }

    for (const team of teams) {
        for (const player of team.players) {
            try {
                let playerName = player.attributes.stats.name
                console.log(playerName)
                let playerExists = await checkPlayerExists(db, playerName)
                let playerId = playerExists?.player?.playerId
                if (!playerExists.exists){
                    let playerInfo = await getPlayerData(playerName)
                    playerId = playerInfo.data[0].id
                    await createPlayer(db, playerName, playerId)
                }



                const m = await findOrCreateMatch(db,{
                    matchId: data.data.id,
                    mapName: data.data.attributes.mapName,
                    duration: data.data.attributes.duration
                });


                await createMatchStats(db, {
                    matchId: data.data.id,
                    playerId: playerId,
                    kills: player.attributes.stats.kills,
                    damage: player.attributes.stats.damageDealt,
                    assists: player.attributes.stats.assists,
                    timeSurvived: player.attributes.stats.timeSurvived,
                    rank: team.attributes.stats.rank,
                    score: player.MVPScore,
                });
            } catch (error) {
                console.error("Error creating player stats:", error);
            }
        }
    }
    await sendTopPlayers()

}

async function sendTopPlayers() {
    const topPlayers = await getTopPlayers(db);
    await sendTopPlayersToDiscord(topPlayers, WEBHOOK_URL);
}

async function sendDataToDiscord(matchId: string) {
    const data = await getData(matchId);
    const teams = getTeams(data);
    const MVP = calculateMVP(data);

    await sendToDiscord(teams, MVP);

}


function getTeams(data: MatchData): Team[] {
    const rosters = data.included.filter(item => item.type === 'roster');
    const participants = data.included.filter(item => item.type === 'participant');

    return rosters.map(roster => {
        const players = roster.relationships.participants.data
            .map(p => {
                const participantData = participants.find(item => item.id === p.id);
                if (participantData) {
                    const mvpScore = calculateMVPScore(participantData, roster.attributes.stats.rank, data.data.attributes.duration, rosters.length);
                    return { ...participantData, MVPScore: mvpScore };
                }
                return null;
            })
            .filter(p => p !== null);

        return {
            ...roster,
            players
        };
    });
}


export async function handleInteraction(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    try {
        switch (interaction.commandName) {
            case 'subscribe':
                const name = interaction.options.getString('name');
                subscriptionChannel = interaction.channel;
                try {
                    await subscribe(name);
                    await interaction.reply({
                        content: `✅ Successfully subscribed ${name} for custom games!`,
                        ephemeral: true
                    });
                } catch (error) {
                    await interaction.reply({
                        content: '❌ Failed to subscribe.',
                        ephemeral: true
                    });
                }
                break;

            case 'unsubscribe':
                await unsubscribe();
                await interaction.reply({
                    content: '✅ Successfully unsubscribed from updates!',
                    ephemeral: true
                });
                break;

            case 'get':
                const playerName = interaction.options.getString('name');
                try {
                    await interaction.reply({
                        content: `Trying to get last custom game in last 15 matches for ${playerName}`,
                        ephemeral: true
                    });

                    const lastMatches = await getLastMatches(playerName, 15);
                    console.log("last matches", lastMatches)
                    const matchId = await getLastCustomGame(lastMatches);
                    console.log("match id", matchId)

                    if (!matchId) {
                        await interaction.followUp({
                            content: `❌ No custom game found in last 15 matches for ${playerName}`,
                            ephemeral: true
                        });
                        return;
                    }

                    await sendDataToDiscord(matchId);

                    await updateDB(matchId)
                } catch (error) {
                    await interaction.followUp({
                        content: '❌ Failed to process request',
                        ephemeral: true
                    });
                }
                break;

            case 'get_id':
                const matchId = interaction.options.getString('id');
                try {
                    await interaction.reply({
                        content: 'Trying to get custom game from id',
                        ephemeral: true
                    });


                    await sendDataToDiscord(matchId);
                    await updateDB(matchId)
                } catch (error) {
                    await interaction.followUp({
                        content: '❌ Failed to process request',
                        ephemeral: true
                    });
                }
                break;
            case 'reset':
                try {
                    await interaction.reply({
                        content: 'Trying to Reset Leaderboard',
                        ephemeral: true
                    });
                    await resetPlayerTotals(db)
                } catch (error) {
                    await interaction.followUp({
                        content: '❌ Failed to process request',
                        ephemeral: true
                    });
                }
                break;
            case 'leaderboard':
                try {
                    await interaction.reply({
                        content: 'Trying to send leaderboard',
                        ephemeral: true
                    });
                    await sendTopPlayers()
                }catch (error) {
                    await interaction.followUp({
                        content: '❌ Failed to process request',
                        ephemeral: true
                    });
                }
                break;
        }
    } catch (error) {
        console.error('Error handling interaction:', error);
        await interaction.reply({
            content: '❌ There was an error processing your request.',
            ephemeral: true
        });
    }
}