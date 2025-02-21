import { eq, and } from 'drizzle-orm';
import { playerGameModeStats, playerRankedStats } from './schema.js';
import {PlayerSeasonData, RankedPlayerStats} from "../types.js";

 // Assuming you have a DB connection setup

// Type definitions for the stats objects
type GameModeStatsInput = {
    playerId: string;
    gameMode: string;
    perspective: string;
    assists?: number;
    boosts?: number;
    dBNOs?: number;
    dailyKills?: number;
    dailyWins?: number;
    damageDealt?: number;
    days?: number;
    headshotKills?: number;
    heals?: number;
    killPoints?: number;
    kills?: number;
    longestKill?: number;
    longestTimeSurvived?: number;
    losses?: number;
    maxKillStreaks?: number;
    mostSurvivalTime?: number;
    revives?: number;
    rideDistance?: number;
    roadKills?: number;
    roundMostKills?: number;
    roundsPlayed?: number;
    suicides?: number;
    swimDistance?: number;
    teamKills?: number;
    timeSurvived?: number;
    top10s?: number;
    vehicleDestroys?: number;
    walkDistance?: number;
    weaponsAcquired?: number;
    weeklyKills?: number;
    weeklyWins?: number;
    winPoints?: number;
    wins?: number;
};

type RankedStatsInput = {
    playerId: string;
    gameMode: string;
    perspective: string;
    currentTier?: string;
    currentSubTier?: string;
    currentRankPoint?: number;
    bestTier?: string;
    bestSubTier?: string;
    bestRankPoint?: number;
    roundsPlayed?: number;
    avgRank?: number;
    avgSurvivalTime?: number;
    top10Ratio?: number;
    winRatio?: number;
    assists?: number;
    wins?: number;
    kda?: number;
    kdr?: number;
    kills?: number;
    deaths?: number;
    roundMostKills?: number;
    longestKill?: number;
    headshotKills?: number;
    headshotKillRatio?: number;
    damageDealt?: number;
    dBNOs?: number;
    reviveRatio?: number;
    revives?: number;
    heals?: number;
    boosts?: number;
    weaponsAcquired?: number;
    teamKills?: number;
    playTime?: number;
    killStreak?: number;
};

// FUNCTIONS FOR PLAYER GAME MODE STATS

// Insert new game mode stats
export async function insertPlayerGameModeStats(db: any, statsData: GameModeStatsInput) {
    try {
        await db.insert(playerGameModeStats).values({
            playerId: statsData.playerId,
            gameMode: statsData.gameMode,
            perspective: statsData.perspective,
            assists: statsData.assists ?? 0,
            boosts: statsData.boosts ?? 0,
            dBNOs: statsData.dBNOs ?? 0,
            dailyKills: statsData.dailyKills ?? 0,
            dailyWins: statsData.dailyWins ?? 0,
            damageDealt: statsData.damageDealt ?? 0,
            days: statsData.days ?? 0,
            headshotKills: statsData.headshotKills ?? 0,
            heals: statsData.heals ?? 0,
            killPoints: statsData.killPoints ?? 0,
            kills: statsData.kills ?? 0,
            longestKill: statsData.longestKill ?? 0,
            longestTimeSurvived: statsData.longestTimeSurvived ?? 0,
            losses: statsData.losses ?? 0,
            maxKillStreaks: statsData.maxKillStreaks ?? 0,
            mostSurvivalTime: statsData.mostSurvivalTime ?? 0,
            revives: statsData.revives ?? 0,
            rideDistance: statsData.rideDistance ?? 0,
            roadKills: statsData.roadKills ?? 0,
            roundMostKills: statsData.roundMostKills ?? 0,
            roundsPlayed: statsData.roundsPlayed ?? 0,
            suicides: statsData.suicides ?? 0,
            swimDistance: statsData.swimDistance ?? 0,
            teamKills: statsData.teamKills ?? 0,
            timeSurvived: statsData.timeSurvived ?? 0,
            top10s: statsData.top10s ?? 0,
            vehicleDestroys: statsData.vehicleDestroys ?? 0,
            walkDistance: statsData.walkDistance ?? 0,
            weaponsAcquired: statsData.weaponsAcquired ?? 0,
            weeklyKills: statsData.weeklyKills ?? 0,
            weeklyWins: statsData.weeklyWins ?? 0,
            winPoints: statsData.winPoints ?? 0,
            wins: statsData.wins ?? 0,
            updatedAt: Math.floor(Date.now() / 1000),
        });
        return true;
    } catch (error) {
        console.error('Error inserting player game mode stats:', error);
        return false;
    }
}

// Update existing game mode stats
export async function updatePlayerGameModeStats(db: any, statsData: GameModeStatsInput) {
    try {
        await db.update(playerGameModeStats)
            .set({
                assists: statsData.assists,
                boosts: statsData.boosts,
                dBNOs: statsData.dBNOs,
                dailyKills: statsData.dailyKills,
                dailyWins: statsData.dailyWins,
                damageDealt: statsData.damageDealt,
                days: statsData.days,
                headshotKills: statsData.headshotKills,
                heals: statsData.heals,
                killPoints: statsData.killPoints,
                kills: statsData.kills,
                longestKill: statsData.longestKill,
                longestTimeSurvived: statsData.longestTimeSurvived,
                losses: statsData.losses,
                maxKillStreaks: statsData.maxKillStreaks,
                mostSurvivalTime: statsData.mostSurvivalTime,
                revives: statsData.revives,
                rideDistance: statsData.rideDistance,
                roadKills: statsData.roadKills,
                roundMostKills: statsData.roundMostKills,
                roundsPlayed: statsData.roundsPlayed,
                suicides: statsData.suicides,
                swimDistance: statsData.swimDistance,
                teamKills: statsData.teamKills,
                timeSurvived: statsData.timeSurvived,
                top10s: statsData.top10s,
                vehicleDestroys: statsData.vehicleDestroys,
                walkDistance: statsData.walkDistance,
                weaponsAcquired: statsData.weaponsAcquired,
                weeklyKills: statsData.weeklyKills,
                weeklyWins: statsData.weeklyWins,
                winPoints: statsData.winPoints,
                wins: statsData.wins,
                updatedAt: Math.floor(Date.now() / 1000),
            })
            .where(
                and(
                    eq(playerGameModeStats.playerId, statsData.playerId),
                    eq(playerGameModeStats.gameMode, statsData.gameMode),
                    eq(playerGameModeStats.perspective, statsData.perspective)
                )
            );
        return true;
    } catch (error) {
        console.error('Error updating player game mode stats:', error);
        return false;
    }
}

// Check if game mode stats exist
export async function checkPlayerGameModeStatsExists(
    db: any,
    playerId: string,
    gameMode: string,
    perspective: string
): Promise<boolean> {
    try {
        const result = await db.select({ count: { value: playerGameModeStats.playerGameModeStatId } })
            .from(playerGameModeStats)
            .where(
                and(
                    eq(playerGameModeStats.playerId, playerId),
                    eq(playerGameModeStats.gameMode, gameMode),
                    eq(playerGameModeStats.perspective, perspective)
                )
            );

        return result.length > 0 && result[0].count.value > 0;
    } catch (error) {
        console.error('Error checking if player game mode stats exist:', error);
        return false;
    }
}

// FUNCTIONS FOR PLAYER RANKED STATS

// Insert new ranked stats
export async function insertPlayerRankedStats(db: any, statsData: RankedStatsInput) {
    try {
        await db.insert(playerRankedStats).values({
            playerId: statsData.playerId,
            gameMode: statsData.gameMode,
            perspective: statsData.perspective,
            currentTier: statsData.currentTier ?? 'Bronze',
            currentSubTier: statsData.currentSubTier ?? '1',
            currentRankPoint: statsData.currentRankPoint ?? 0,
            bestTier: statsData.bestTier ?? 'Bronze',
            bestSubTier: statsData.bestSubTier ?? '1',
            bestRankPoint: statsData.bestRankPoint ?? 0,
            roundsPlayed: statsData.roundsPlayed ?? 0,
            avgRank: statsData.avgRank ?? 0,
            avgSurvivalTime: statsData.avgSurvivalTime ?? 0,
            top10Ratio: statsData.top10Ratio ?? 0,
            winRatio: statsData.winRatio ?? 0,
            assists: statsData.assists ?? 0,
            wins: statsData.wins ?? 0,
            kda: statsData.kda ?? 0,
            kdr: statsData.kdr ?? 0,
            kills: statsData.kills ?? 0,
            deaths: statsData.deaths ?? 0,
            roundMostKills: statsData.roundMostKills ?? 0,
            longestKill: statsData.longestKill ?? 0,
            headshotKills: statsData.headshotKills ?? 0,
            headshotKillRatio: statsData.headshotKillRatio ?? 0,
            damageDealt: statsData.damageDealt ?? 0,
            dBNOs: statsData.dBNOs ?? 0,
            reviveRatio: statsData.reviveRatio ?? 0,
            revives: statsData.revives ?? 0,
            heals: statsData.heals ?? 0,
            boosts: statsData.boosts ?? 0,
            weaponsAcquired: statsData.weaponsAcquired ?? 0,
            teamKills: statsData.teamKills ?? 0,
            playTime: statsData.playTime ?? 0,
            killStreak: statsData.killStreak ?? 0,
            updatedAt: Math.floor(Date.now() / 1000),
        });
        return true;
    } catch (error) {
        console.error('Error inserting player ranked stats:', error);
        return false;
    }
}

// Update existing ranked stats
export async function updatePlayerRankedStats(db: any, statsData: RankedStatsInput) {
    try {
        await db.update(playerRankedStats)
            .set({
                currentTier: statsData.currentTier,
                currentSubTier: statsData.currentSubTier,
                currentRankPoint: statsData.currentRankPoint,
                bestTier: statsData.bestTier,
                bestSubTier: statsData.bestSubTier,
                bestRankPoint: statsData.bestRankPoint,
                roundsPlayed: statsData.roundsPlayed,
                avgRank: statsData.avgRank,
                avgSurvivalTime: statsData.avgSurvivalTime,
                top10Ratio: statsData.top10Ratio,
                winRatio: statsData.winRatio,
                assists: statsData.assists,
                wins: statsData.wins,
                kda: statsData.kda,
                kdr: statsData.kdr,
                kills: statsData.kills,
                deaths: statsData.deaths,
                roundMostKills: statsData.roundMostKills,
                longestKill: statsData.longestKill,
                headshotKills: statsData.headshotKills,
                headshotKillRatio: statsData.headshotKillRatio,
                damageDealt: statsData.damageDealt,
                dBNOs: statsData.dBNOs,
                reviveRatio: statsData.reviveRatio,
                revives: statsData.revives,
                heals: statsData.heals,
                boosts: statsData.boosts,
                weaponsAcquired: statsData.weaponsAcquired,
                teamKills: statsData.teamKills,
                playTime: statsData.playTime,
                killStreak: statsData.killStreak,
                updatedAt: Math.floor(Date.now() / 1000),
            })
            .where(
                and(
                    eq(playerRankedStats.playerId, statsData.playerId),
                    eq(playerRankedStats.gameMode, statsData.gameMode),
                    eq(playerRankedStats.perspective, statsData.perspective)
                )
            );
        return true;
    } catch (error) {
        console.error('Error updating player ranked stats:', error);
        return false;
    }
}

// Check if ranked stats exist
export async function checkPlayerRankedStatsExists(
    db: any,
    playerId: string,
    gameMode: string,
    perspective: string
): Promise<boolean> {
    try {
        const result = await db.select({ count: { value: playerRankedStats.playerRankedStatId } })
            .from(playerRankedStats)
            .where(
                and(
                    eq(playerRankedStats.playerId, playerId),
                    eq(playerRankedStats.gameMode, gameMode),
                    eq(playerRankedStats.perspective, perspective)
                )
            );

        return result.length > 0 && result[0].count.value > 0;
    } catch (error) {
        console.error('Error checking if player ranked stats exist:', error);
        return false;
    }
}

// COMBINED UTILITY FUNCTIONS

// Upsert game mode stats (insert if not exists, update if exists)
export async function upsertPlayerGameModeStats(db: any, statsData: GameModeStatsInput) {
    const exists = await checkPlayerGameModeStatsExists(
        db,
        statsData.playerId,
        statsData.gameMode,
        statsData.perspective
    );

    if (exists) {
        return await updatePlayerGameModeStats(db, statsData);
    } else {
        return await insertPlayerGameModeStats(db, statsData);
    }
}

// Upsert ranked stats (insert if not exists, update if exists)
export async function upsertPlayerRankedStats(db: any, statsData: RankedStatsInput) {
    const exists = await checkPlayerRankedStatsExists(
        db,
        statsData.playerId,
        statsData.gameMode,
        statsData.perspective
    );

    if (exists) {
        return await updatePlayerRankedStats(db, statsData);
    } else {
        return await insertPlayerRankedStats(db, statsData);
    }
}


export function transformPlayerSeasonData(playerSeasonData: PlayerSeasonData): GameModeStatsInput[] {
    const { attributes: seasonAttributes } = playerSeasonData.data;
    const playerId = playerSeasonData.data.relationships.player.data.id;

    return Object.entries(seasonAttributes.gameModeStats).map(([gameMode, stats]) => {
        const [mode, perspective] = gameMode.split('-');
        return {
            playerId,
            gameMode: mode,
            perspective: perspective || 'tpp', // Default to 'tpp' if no perspective is specified
            assists: stats.assists,
            boosts: stats.boosts,
            dBNOs: stats.dBNOs,
            dailyKills: stats.dailyKills,
            dailyWins: stats.dailyWins,
            damageDealt: stats.damageDealt,
            days: stats.days,
            headshotKills: stats.headshotKills,
            heals: stats.heals,
            killPoints: stats.killPoints,
            kills: stats.kills,
            longestKill: stats.longestKill,
            longestTimeSurvived: stats.longestTimeSurvived,
            losses: stats.losses,
            maxKillStreaks: stats.maxKillStreaks,
            mostSurvivalTime: stats.mostSurvivalTime,
            revives: stats.revives,
            rideDistance: stats.rideDistance,
            roadKills: stats.roadKills,
            roundMostKills: stats.roundMostKills,
            roundsPlayed: stats.roundsPlayed,
            suicides: stats.suicides,
            swimDistance: stats.swimDistance,
            teamKills: stats.teamKills,
            timeSurvived: stats.timeSurvived,
            top10s: stats.top10s,
            vehicleDestroys: stats.vehicleDestroys,
            walkDistance: stats.walkDistance,
            weaponsAcquired: stats.weaponsAcquired,
            weeklyKills: stats.weeklyKills,
            weeklyWins: stats.weeklyWins,
            winPoints: stats.winPoints,
            wins: stats.wins,
        };
    });
}

export function transformRankedPlayerStats(rankedPlayerStats: RankedPlayerStats): RankedStatsInput[] {
    const { attributes: rankedAttributes } = rankedPlayerStats.data;
    const playerId = rankedPlayerStats.data.relationships.player.data.id;

    return Object.entries(rankedAttributes.rankedGameModeStats).map(([gameMode, stats]) => {
        const [mode, perspective] = gameMode.split('-');
        return {
            playerId,
            gameMode: mode,
            perspective: perspective || 'tpp', // Default to 'tpp' if no perspective is specified
            currentTier: stats.currentTier.tier,
            currentSubTier: stats.currentTier.subTier,
            currentRankPoint: stats.currentRankPoint,
            bestTier: stats.bestTier.tier,
            bestSubTier: stats.bestTier.subTier,
            bestRankPoint: stats.bestRankPoint,
            roundsPlayed: stats.roundsPlayed,
            avgRank: stats.avgRank,
            avgSurvivalTime: stats.avgSurvivalTime,
            top10Ratio: stats.top10Ratio,
            winRatio: stats.winRatio,
            assists: stats.assists,
            wins: stats.wins,
            kda: stats.kda,
            kdr: stats.kdr,
            kills: stats.kills,
            deaths: stats.deaths,
            roundMostKills: stats.roundMostKills,
            longestKill: stats.longestKill,
            headshotKills: stats.headshotKills,
            headshotKillRatio: stats.headshotKillRatio,
            damageDealt: stats.damageDealt,
            dBNOs: stats.dBNOs,
            reviveRatio: stats.reviveRatio,
            revives: stats.revives,
            heals: stats.heals,
            boosts: stats.boosts,
            weaponsAcquired: stats.weaponsAcquired,
            teamKills: stats.teamKills,
            playTime: stats.playTime,
            killStreak: stats.killStreak,
        };
    });
}

//
// // Parse and upsert game mode stats from API JSON
// export async function processPlayerGameModeStats(db: any, playerId: string, gameModeStatsJson: any) {
//     try {
//         // Process each game mode (solo, duo, squad, etc.)
//         for (const [gameModeKey, stats] of Object.entries(gameModeStatsJson)) {
//             // Split game mode and perspective (e.g., "squad-fpp" -> "squad", "fpp")
//             let gameMode = gameModeKey;
//             let perspective = "tpp"; // Default perspective
//
//             if (gameModeKey.includes("-fpp")) {
//                 gameMode = gameModeKey.split("-fpp")[0];
//                 perspective = "fpp";
//             }
//
//             // Prepare stats data
//             const statsData: GameModeStatsInput = {
//                 playerId,
//                 gameMode,
//                 perspective,
//                 ...stats as any // Cast stats to any to handle the JSON structure
//             };
//
//             // Upsert the stats
//             await upsertPlayerGameModeStats(db, statsData);
//         }
//         return true;
//     } catch (error) {
//         console.error('Error processing player game mode stats:', error);
//         return false;
//     }
// }
//
// // Parse and upsert ranked stats from API JSON
// export async function processPlayerRankedStats(db: DB, playerId: string, rankedStatsJson: any) {
//     try {
//         // Process each ranked game mode (typically just squad and squad-fpp)
//         for (const [gameModeKey, stats] of Object.entries(rankedStatsJson)) {
//             // Split game mode and perspective
//             let gameMode = gameModeKey;
//             let perspective = "tpp"; // Default perspective
//
//             if (gameModeKey.includes("-fpp")) {
//                 gameMode = gameModeKey.split("-fpp")[0];
//                 perspective = "fpp";
//             }
//
//             // Extract tier information
//             const currentTier = stats.currentTier?.tier || "Bronze";
//             const currentSubTier = stats.currentTier?.subTier || "1";
//             const bestTier = stats.bestTier?.tier || "Bronze";
//             const bestSubTier = stats.bestTier?.subTier || "1";
//
//             // Prepare stats data
//             const statsData: RankedStatsInput = {
//                 playerId,
//                 gameMode,
//                 perspective,
//                 currentTier,
//                 currentSubTier,
//                 currentRankPoint: stats.currentRankPoint,
//                 bestTier,
//                 bestSubTier,
//                 bestRankPoint: stats.bestRankPoint,
//                 roundsPlayed: stats.roundsPlayed,
//                 avgRank: stats.avgRank,
//                 avgSurvivalTime: stats.avgSurvivalTime,
//                 top10Ratio: stats.top10Ratio,
//                 winRatio: stats.winRatio,
//                 assists: stats.assists,
//                 wins: stats.wins,
//                 kda: stats.kda,
//                 kdr: stats.kdr,
//                 kills: stats.kills,
//                 deaths: stats.deaths,
//                 roundMostKills: stats.roundMostKills,
//                 longestKill: stats.longestKill,
//                 headshotKills: stats.headshotKills,
//                 headshotKillRatio: stats.headshotKillRatio,
//                 damageDealt: stats.damageDealt,
//                 dBNOs: stats.dBNOs,
//                 reviveRatio: stats.reviveRatio,
//                 revives: stats.revives,
//                 heals: stats.heals,
//                 boosts: stats.boosts,
//                 weaponsAcquired: stats.weaponsAcquired,
//                 teamKills: stats.teamKills,
//                 playTime: stats.playTime,
//                 killStreak: stats.killStreak,
//             };
//
//             // Upsert the stats
//             await upsertPlayerRankedStats(db, statsData);
//         }
//         return true;
//     } catch (error) {
//         console.error('Error processing player ranked stats:', error);
//         return false;
//     }
// }
//
// // Master function to process all player stats
// export async function processAllPlayerStats(
//     db: DB,
//     playerId: string,
//     statsData: {
//         gameModeStats?: any;
//         rankedGameModeStats?: any;
//     }
// ) {
//     try {
//         const results = {
//             gameModeStats: false,
//             rankedGameModeStats: false
//         };
//
//         // Process game mode stats if provided
//         if (statsData.gameModeStats) {
//             results.gameModeStats = await processPlayerGameModeStats(
//                 db,
//                 playerId,
//                 statsData.gameModeStats
//             );
//         }
//
//         // Process ranked stats if provided
//         if (statsData.rankedGameModeStats) {
//             results.rankedGameModeStats = await processPlayerRankedStats(
//                 db,
//                 playerId,
//                 statsData.rankedGameModeStats
//             );
//         }
//
//         return results;
//     } catch (error) {
//         console.error('Error processing all player stats:', error);
//         return {
//             gameModeStats: false,
//             rankedGameModeStats: false
//         };
//     }
// }

