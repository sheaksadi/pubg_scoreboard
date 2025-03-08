import {integer, real, text, sqliteTable, primaryKey} from 'drizzle-orm/sqlite-core';
import {eq, or, sql} from 'drizzle-orm';

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


export const discordUsers = sqliteTable('discord_users', {
    discordId: text('discord_id').primaryKey().notNull().unique(),
    username: text('username').notNull(),
    avatar: text('avatar'),
    discriminator: text('discriminator'),
    public_flags: integer('public_flags'),
    flags: integer('flags'),
    banner: text('banner'),
    accent_color: integer('accent_color'),
    global_name: text('global_name'),
    avatar_decoration_data: text('avatar_decoration_data'),
    banner_color: text('banner_color'),
    email: text('email'), // Remove .notNull() to make it optional
    createdAt: integer('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const discordRoles = sqliteTable('discord_roles', {
    roleId: text('role_id').primaryKey().notNull().unique(),
    name: text('name').notNull().unique(),
    color: integer('color'),
    createdAt: integer('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const discordUserRoles = sqliteTable('discord_user_roles', {
    discordId: text('discord_id')
        .notNull()
        .references(() => discordUsers.discordId, { onDelete: 'cascade' }),
    roleId: text('role_id')
        .notNull()
        .references(() => discordRoles.roleId, { onDelete: 'cascade' }),
    assignedAt: integer('assigned_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    pk: primaryKey({ columns: [table.discordId, table.roleId] })
}));

export const Members = sqliteTable('members', {
    id: integer('id').primaryKey(),
    playerId: text('player_id')
        .references(() => players.playerId),
    discordId: text('discord_id')
        .references(() => discordUsers.discordId),
    adminPrivilege: integer('admin_privilege').default(0),
    nickname: text('nickname'),
    totalPubgPlayed: integer('total_pubg_played').default(0),
    createdAt: integer('created_at').default(sql`CURRENT_TIMESTAMP`),
})

export const discordChannelSessions = sqliteTable('discord_channel_sessions', {
    id: text('id').primaryKey().notNull().unique(),
    channelId: text('channel_id'),
    guildId: text('guild_id'),
    memberId: text('member_id'),
    duration: integer('duration'),
    createdAt: integer('created_at').default(sql`CURRENT_TIMESTAMP`),
})

export const memberActivities = sqliteTable('member_activities', {
    id: integer('id').primaryKey(),
    memberId: text('member_id')
        .references(() => Members.id),
    sessionId: text('session_id'),
    activity: text('activity'),
    details: text('details'),
    duration: integer('duration'),
    createdAt: integer('created_at').default(sql`CURRENT_TIMESTAMP`),
})

export const memberPubgActivities = sqliteTable('member_pubg_activities', {
    id: integer('id').primaryKey(),
    memberId: text('member_id')
        .references(() => Members.id),
    sessionId: text('session_id'),
    activity: text('activity'),
    details: text('details'),
    duration: integer('duration'),
    gameMode: text('game_mode'),
    mapName: text('map_name'),
    createdAt: integer('created_at').default(sql`CURRENT_TIMESTAMP`),
})




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


// Player Game Mode Stats table (aggregated stats by game mode)
export const playerGameModeStats = sqliteTable('player_game_mode_stats', {
    playerGameModeStatId: integer('player_game_mode_stat_id').primaryKey(),
    playerId: text('player_id')
        .references(() => players.playerId),
    gameMode: text('game_mode').notNull(), // 'solo', 'duo', 'squad', etc.
    perspective: text('perspective'), // 'fpp' or 'tpp'
    assists: integer('assists').default(0),
    boosts: integer('boosts').default(0),
    dBNOs: integer('dbnos').default(0),
    dailyKills: integer('daily_kills').default(0),
    dailyWins: integer('daily_wins').default(0),
    damageDealt: real('damage_dealt').default(0),
    days: integer('days').default(0),
    headshotKills: integer('headshot_kills').default(0),
    heals: integer('heals').default(0),
    killPoints: integer('kill_points').default(0),
    kills: integer('kills').default(0),
    longestKill: real('longest_kill').default(0),
    longestTimeSurvived: integer('longest_time_survived').default(0),
    losses: integer('losses').default(0),
    maxKillStreaks: integer('max_kill_streaks').default(0),
    mostSurvivalTime: integer('most_survival_time').default(0),
    revives: integer('revives').default(0),
    rideDistance: real('ride_distance').default(0),
    roadKills: integer('road_kills').default(0),
    roundMostKills: integer('round_most_kills').default(0),
    roundsPlayed: integer('rounds_played').default(0),
    suicides: integer('suicides').default(0),
    swimDistance: real('swim_distance').default(0),
    teamKills: integer('team_kills').default(0),
    timeSurvived: integer('time_survived').default(0),
    top10s: integer('top10s').default(0),
    vehicleDestroys: integer('vehicle_destroys').default(0),
    walkDistance: real('walk_distance').default(0),
    weaponsAcquired: integer('weapons_acquired').default(0),
    weeklyKills: integer('weekly_kills').default(0),
    weeklyWins: integer('weekly_wins').default(0),
    winPoints: integer('win_points').default(0),
    wins: integer('wins').default(0),
    updatedAt: integer('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Ranked Stats table (for ranked mode statistics)
export const playerRankedStats = sqliteTable('player_ranked_stats', {
    playerRankedStatId: integer('player_ranked_stat_id').primaryKey(),
    playerId: text('player_id')
        .references(() => players.playerId),
    gameMode: text('game_mode').notNull(), // 'squad', etc.
    perspective: text('perspective'), // 'fpp' or 'tpp'
    currentTier: text('current_tier').default('Bronze'),
    currentSubTier: text('current_sub_tier').default('1'),
    currentRankPoint: integer('current_rank_point').default(0),
    bestTier: text('best_tier').default('Bronze'),
    bestSubTier: text('best_sub_tier').default('1'),
    bestRankPoint: integer('best_rank_point').default(0),
    roundsPlayed: integer('rounds_played').default(0),
    avgRank: real('avg_rank').default(0),
    avgSurvivalTime: real('avg_survival_time').default(0),
    top10Ratio: real('top10_ratio').default(0),
    winRatio: real('win_ratio').default(0),
    assists: integer('assists').default(0),
    wins: integer('wins').default(0),
    kda: real('kda').default(0),
    kdr: real('kdr').default(0),
    kills: integer('kills').default(0),
    deaths: integer('deaths').default(0),
    roundMostKills: integer('round_most_kills').default(0),
    longestKill: real('longest_kill').default(0),
    headshotKills: integer('headshot_kills').default(0),
    headshotKillRatio: real('headshot_kill_ratio').default(0),
    damageDealt: real('damage_dealt').default(0),
    dBNOs: integer('dbnos').default(0),
    reviveRatio: real('revive_ratio').default(0),
    revives: integer('revives').default(0),
    heals: integer('heals').default(0),
    boosts: integer('boosts').default(0),
    weaponsAcquired: integer('weapons_acquired').default(0),
    teamKills: integer('team_kills').default(0),
    playTime: integer('play_time').default(0),
    killStreak: integer('kill_streak').default(0),
    updatedAt: integer('updated_at').default(sql`CURRENT_TIMESTAMP`),
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
    try {
        const player = await db.select()
            .from(players)
            .where(eq(players.playerId, data.playerId));

        const match = await db.select()
            .from(matches)
            .where(eq(matches.matchId, data.matchId));

        if (!player || player.length === 0) {
            throw new Error(`Player with ID ${data.playerId} not found`);
        }

        if (!match || match.length === 0) {
            throw new Error(`Match with ID ${data.matchId} not found`);
        }

        const result = await db.insert(matchStats)
            .values(data)
            .returning({ matchStatId: matchStats.matchStatId });

        // Update player totals
        await updatePlayerTotals(db, data.playerId, {
            score: data.score,
            kills: data.kills,
            assists: data.assists,
            damage: data.damage
        });

        return result;
    }catch (error) {
        console.error('Error in createMatchStats:', error);
    }

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
    try {

        // Try to find existing player
        const existingPlayer = await db.select()
            .from(players)
            .where(eq(players.username, username));


        if (existingPlayer.length > 0) {
            return existingPlayer[0];
        }

        // If no player exists, create new one
        const newPlayerData = {
            username: username,
            playerId: playerId || crypto.randomUUID(),
            totalScore: 0,
            totalKills: 0,
            totalAssists: 0,
            totalDamage: 0,
            totalMatchesPlayed: 0,
        };



        const insertResult = await db.insert(players)
            .values(newPlayerData)
            .returning();



        if (!insertResult || insertResult.length === 0) {
            throw new Error('Insert returned no data');
        }

        return insertResult[0];
    } catch (error) {
        // Detailed error logging
        console.error('Error in findOrCreatePlayer:', {
            error,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};
export const checkPlayerExists = async (db: any, username: string) => {
    try {
        const result = await db.select()
            .from(players)
            .where(eq(players.username, username));



        return {
            exists: result.length > 0,
            player: result.length > 0 ? result[0] : null
        };
    } catch (error) {
        console.error('Error checking player:', error);
        throw error;
    }
};