import axios from 'axios';
import { WEBHOOK_URL, db } from './config.js';
import { Team, Participant, MatchData } from './types.js';


export async function sendTopPlayersToDiscord(topPlayers: any[], webhookUrl: string) {
    if (topPlayers.length === 0) {
        console.log("No top players to send.");
        return;
    }

    const embeds = topPlayers.map((player, index) => ({
        title: `#${index + 1} - ${player.username}`,
        description: `**Total Score:** ${player.totalScore}\n**Kills:** ${player.totalKills} | **Assists:** ${player.totalAssists} | **Damage:** ${Math.round(player.totalDamage)}`,
        color: index === 0 ? 0xFFD700 : 0x00FFFF,
    }));

    const payload = {
        username: "Top Players",
        embeds,
        avatar_url: process.env.DISCORD_AVATAR || undefined,
    };

    try {
        await axios.post(webhookUrl, payload);
        console.log("Top players sent to Discord successfully!");
    } catch (error) {
        console.error("Error sending top players to Discord:", error);
        throw error;
    }
}

async function sendAllTeamsToDiscord(teams: Team[], webhookUrl: string, MVP: Participant) {
    const sortedTeams = teams.sort(
        (a: Team, b: Team) => a.attributes.stats.rank - b.attributes.stats.rank
    );

    const embeds = sortedTeams.map((team, index) => {
        let totalKills = 0;
        const playerFields = team.players.map((player: any) => {
            const stats = player.attributes.stats;
            totalKills += stats.kills;
            let name = stats.name;
            name += MVP.id === player.id ? "  (👑MVP)" : "";

            return {
                name: name,
                value: `Kills: ${stats.kills}\nDamage: ${Math.round(stats.damageDealt)}\nAssists: ${stats.assists}`,
                inline: true,
            };
        });

        const color = index === 0 ? 0xFF0000 :
            index === 1 ? 0xFFA500 :
                index === 2 ? 0xFFFF00 : 0x00FFFF;

        return {
            title: `Team #${team.attributes.stats.teamId} - Rank: ${team.attributes.stats.rank}`,
            description: `${team.attributes.won === "true" ? "🏆 Winner!\n" : ""}**Total Kills:** ${totalKills}`,
            fields: playerFields.length > 0 ? playerFields : [{
                name: "No Players",
                value: "This team has no players.",
                inline: true
            }],
            color: color,
        };
    });

    // Split embeds into chunks of 10 (Discord limit)
    const chunkSize = 10;
    for (let i = 0; i < embeds.length; i += chunkSize) {
        const embedChunk = embeds.slice(i, i + chunkSize);
        const payload = {
            username: "PUBG Match Stats",
            embeds: embedChunk,
            avatar_url: process.env.DISCORD_AVATAR
        };

        try {
            await axios.post(webhookUrl, payload);
            console.log(`Successfully sent teams ${i + 1}-${i + embedChunk.length} to Discord!`);
        } catch (error) {
            console.error("Error sending webhook message:", error);
            throw error;
        }
    }
}


export async function sendToDiscord(teams: Team[], MVP: Participant) {
    try {
        await sendAllTeamsToDiscord(teams, WEBHOOK_URL, MVP);

    } catch (error) {
        console.error("Error in sendToDiscord:", error);
        throw error;
    }
}