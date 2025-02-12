import { integer, real, text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Players table
export const players = sqliteTable('players', {
    playerId: text('player_id').primaryKey().notNull().unique(),
    username: text('username').notNull().unique(),
    totalScore: integer('total_score').default(0),
    totalKills: integer('total_kills').default(0),
    totalAssists: integer('total_assists').default(0),
    totalDamage: integer('total_damage').default(0),
    totalMatchesPlayed: integer('total_matches_played').default(0),
    createdAt: integer('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Matches table
export const matches = sqliteTable('matches', {
    matchId: text('match_id').primaryKey().notNull().unique(),  // Changed to text to match your createMatch function
    matchDate: integer('match_date').default(sql`CURRENT_TIMESTAMP`),
    mapName: text('map_name'),
    durationMinutes: integer('duration_minutes'),
});

// Match stats table
export const matchStats = sqliteTable('match_stats', {
    matchStatId: integer('match_stat_id').primaryKey(),
    matchId: text('match_id')  // Changed to text to match matches table
        .references(() => matches.matchId),
    playerId: text('player_id')  // Changed to text to match players table
        .references(() => players.playerId),
    kills: integer('kills').default(0),
    damage: integer('damage').default(0),
    assists: integer('assists').default(0),
    score: integer('score').default(0),
    rank: integer('rank').default(0),
    timeSurvived: integer('time_survived').default(0),
    teamId: integer('team_id').default(0),
    createdAt: integer('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// export const createMatchStats = async (
//     db: any,
//     data: {
//         kills: number;
//         damage: number;
//         assists: number;
//         rank: number;
//         timeSurvived: number;
//         matchId: string;
//         playerId: string;
//         score: number;
//     }
// ) => {
//     // Debug: Check if player exists
//     const playerExists = await db.select()
//         .from(players)
//         .where(sql`${players.playerId} = ${data.playerId}`)
//         .limit(1);
//
//     // Debug: Check if match exists
//     const matchExists = await db.select()
//         .from(matches)
//         .where(sql`${matches.matchId} = ${data.matchId}`)
//         .limit(1);
//
//     console.log('Player exists:', playerExists.length > 0);
//     console.log('Match exists:', matchExists.length > 0);
//     console.log('Attempting to create match stats with data:', data);
//
//     if (!playerExists.length) {
//         throw new Error(`Player with ID ${data.playerId} not found`);
//     }
//
//     if (!matchExists.length) {
//         throw new Error(`Match with ID ${data.matchId} not found`);
//     }
//
//     const result = await db.insert(matchStats)
//         .values(data)
//         .returning({ matchStatId: matchStats.matchStatId });
//
//     await updatePlayerTotals(db, data.playerId, {
//         score: data.score,
//         kills: data.kills,
//         assists: data.assists,
//         damage: data.damage
//     });
//
//     return result;
// };
// Update other function signatures
export const getPlayerMatchHistory = (db: any, playerId: string) => {  // Changed type to string
    return db.select({
        matchDate: matches.matchDate,
        kills: matchStats.kills,
        assists: matchStats.assists,
        score: matchStats.score,
    })
        .from(matchStats)
        .innerJoin(matches, sql`${matches.matchId} = ${matchStats.matchId}`)
        .where(sql`${matchStats.playerId} = ${playerId}`)
        .orderBy(sql`${matches.matchDate} DESC`);
};

export const updatePlayerTotals = async (
    db: any,
    playerId: string,  // Changed type to string
    stats: {
        score: number;
        kills: number;
        assists: number;
        damage: number;
    }
) => {
    await db.update(players)
        .set({
            totalScore: sql`${players.totalScore} + ${stats.score}`,
            totalKills: sql`${players.totalKills} + ${stats.kills}`,
            totalAssists: sql`${players.totalAssists} + ${stats.assists}`,
            totalDamage: sql`${players.totalDamage} + ${stats.damage}`,
            totalMatchesPlayed: sql`${players.totalMatchesPlayed} + 1`,
        })
        .where(sql`${players.playerId} = ${playerId}`);
};
// Helper function to create a new player
export const createPlayer = async (
    db: any,
    username: string,
    playerId: string
) => {
    return await db.insert(players)
        .values({ username, playerId: playerId })
        .returning({ playerId: players.playerId });
};

// Helper function to create a new match
export const createMatch = async (
    db: any,
    matchId: string,
    mapName: string,
    durationMinutes: number
) => {
    console.log("Creating match:", matchId, mapName, durationMinutes);
    return await db.insert(matches)
        .values({ mapName, durationMinutes, matchId })
        .returning({ matchId: matches.matchId });
};

export const findOrCreateMatch = async (
    db: any,
    matchData: {
        matchId: string;
        mapName: string;
        duration: number;
    }
) => {
    try {
        // Try to find an existing match
        const existingMatch = await db.select()
            .from(matches)
            .where(sql`${matches.matchId} = ${matchData.matchId}`)
            .limit(1);

        if (existingMatch?.[0]) {
            return {
                success: true,
                match: existingMatch[0],
                isNew: false
            };
        }

        // Create a new match if not found
        const newMatch = await createMatch(db, matchData.matchId, matchData.mapName, matchData.duration);

        return {
            success: true,
            match: newMatch[0],
            isNew: true
        };

    } catch (error) {
        console.error('Error in findOrCreateMatch:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

// // Helper function to create match stats for a player
export const createMatchStats = async (
    db: any,
    data: {
        kills: number;
        damage: number;
        assists: number;
        rank: number;
        timeSurvived: number;
        matchId: string;
        playerId: string;
        score: number;

    }
) => {
    const result = await db.insert(matchStats)
        .values(data)
        .returning({ matchStatId: matchStats.matchStatId });

    // Update player totals
    await updatePlayerTotals(db, data.playerId, {
        score: data.score,
        kills: data.kills,
        assists: data.assists,
        damage: 0 // Add damage when available
    });

    return result;
};

// export const getPlayerMatchHistory = (db: any, playerId: number) => {
//     return db.select({
//         matchDate: matches.matchDate,
//         kills: matchStats.kills,
//         assists: matchStats.assists,
//         score: matchStats.score,
//     })
//         .from(matchStats)
//         .innerJoin(matches, sql`${matches.matchId} = ${matchStats.matchId}`)
//         .where(sql`${matchStats.playerId} = ${playerId}`)
//         .orderBy(sql`${matches.matchDate} DESC`);
// };
export const resetPlayerTotals = async (
    db: any,
    playerId?: string // Make playerId optional
) => {
    try {
        if (playerId) {
            // Reset totals for a specific player
            await db.update(players)
                .set({
                    totalScore: 0,
                    totalKills: 0,
                    totalAssists: 0,
                    totalDamage: 0,
                    totalMatchesPlayed: 0,
                })
                .where(sql`${players.playerId} = ${playerId}`);

            console.log(`Player ${playerId} totals reset successfully.`);
        } else {
            // Reset totals for all players
            await db.update(players)
                .set({
                    totalScore: 0,
                    totalKills: 0,
                    totalAssists: 0,
                    totalDamage: 0,
                    totalMatchesPlayed: 0,
                });

            console.log("All players' totals reset successfully.");
        }
    } catch (error) {
        console.error("Error resetting player totals:", error);
        throw error; // Re-throw the error for handling upstream
    }
};
export const getTopPlayers = (db: any, limit: number = 10) => {
    return db.select({
        username: players.username,
        totalScore: players.totalScore,
        totalKills: players.totalKills,
        totalAssists: players.totalAssists,
        totalDamage: players.totalDamage
    })
        .from(players)
        .orderBy(sql`${players.totalScore} DESC`)
        .limit(limit);
};

// // Updated helper function to update player totals after a match
// export const updatePlayerTotals = async (
//     db: any,
//     playerId: number,
//     stats: {
//         score: number;
//         kills: number;
//         assists: number;
//         damage: number;
//     }
// ) => {
//     await db.update(players)
//         .set({
//             totalScore: sql`${players.totalScore} + ${stats.score}`,
//             totalKills: sql`${players.totalKills} + ${stats.kills}`,
//             totalAssists: sql`${players.totalAssists} + ${stats.assists}`,
//             totalDamage: sql`${players.totalDamage} + ${stats.damage}`,
//             totalMatchesPlayed: sql`${players.totalMatchesPlayed} + 1`,
//         })
//         .where(sql`${players.playerId} = ${playerId}`);
// };
//

export const getPlayerStats = async (db: any, playerId: number) => {
    return await db.select()
        .from(players)
        .where(sql`${players.playerId} = ${playerId}`);
};


export const getMatchDetails = async (db: any, matchId: number) => {
    return await db.select({
        match: matches,
        players: {
            username: players.username,
            stats: matchStats
        }
    })
        .from(matches)
        .innerJoin(matchStats, sql`${matches.matchId} = ${matchStats.matchId}`)
        .innerJoin(players, sql`${matchStats.playerId} = ${players.playerId}`)
        .where(sql`${matches.matchId} = ${matchId}`);
};


export const findOrCreatePlayer = async (db: any, username: string, playerId?: string) => {
    // Try to find existing player
    const existingPlayer = await db.select()
        .from(players)
        .where(sql`${players.username} = ${username}`)
        .limit(1);

    if (existingPlayer.length > 0) {
        return existingPlayer[0];
    }

    // Create new player if not found
    const [newPlayer] = await createPlayer(db, username, playerId);
    return newPlayer;
};
