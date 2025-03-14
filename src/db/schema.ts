import {integer, real, text, pgTable, primaryKey, timestamp, serial, jsonb} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Players table
export const players = pgTable('players', {
    playerId: text('player_id').primaryKey().notNull().unique(),
    username: text('username').notNull().unique(),
    totalScore: integer('total_score').default(0),
    totalKills: integer('total_kills').default(0),
    totalAssists: integer('total_assists').default(0),
    totalDamage: integer('total_damage').default(0),
    totalMatchesPlayed: integer('total_matches_played').default(0),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Discord Users table
export const discordUsers = pgTable('discord_users', {
    id: text('id').primaryKey().notNull().unique(),
    username: text('username').notNull(),
    roles: jsonb("roles").default([]),
    avatar: text('avatar'),
    discriminator: text('discriminator'),
    public_flags: integer('public_flags'),
    flags: integer('flags'),
    banner: text('banner'),
    accent_color: integer('accent_color'),
    global_name: text('global_name'),
    avatar_decoration_data: text('avatar_decoration_data'),
    banner_color: text('banner_color'),
    email: text('email'),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});


// Members table - Changed from PascalCase to camelCase for consistency
export const members = pgTable('members', {
    id: serial('id').primaryKey(), // Changed to text type to match with how it's referenced
    playerId: text('player_id')
        .references(() => players.playerId),
    discordId: text('discord_id')
        .references(() => discordUsers.id),
    adminPrivilege: integer('admin_privilege').default(0),
    nickname: text('nickname'),
    totalPubgPlayed: integer('total_pubg_played').default(0),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Discord Channel Sessions table
export const discordChannelSessions = pgTable('discord_channel_sessions', {
    id: text('id').primaryKey().unique().notNull(),
    channelId: text('channel_id').notNull(),
    guildId: text('guild_id').default(""),
    memberId: integer('member_id').notNull()
        .references(() => members.id), // Added reference to ensure consistency
    duration: integer('duration').notNull(),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Member Activities table
export const memberActivities = pgTable('member_activities', {
    id: serial('id').primaryKey(), // Changed to text for consistency
    memberId: integer('member_id') // Changed to text to match members.id
        .references(() => members.id),
    sessionId: text('session_id'),// Added reference
    activity: text('activity'),
    details: text('details'),
    duration: integer('duration'),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Member PUBG Activities table
export const memberPubgActivities = pgTable('member_pubg_activities', {
    id: serial('id').primaryKey(), // Changed to text for consistency
    memberId: integer('member_id') // Changed to text to match members.id
        .references(() => members.id),
    sessionId: text('session_id'),
    details: text('details'),
    duration: integer('duration'),
    gameMode: text('game_mode'),
    mapName: text('map_name'),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Matches table
export const matches = pgTable('matches', {
    matchId: text('match_id').primaryKey().notNull().unique(),
    matchDate: timestamp('match_date').default(sql`CURRENT_TIMESTAMP`),
    mapName: text('map_name'),
    durationMinutes: integer('duration_minutes'),
});

// Match stats table
export const matchStats = pgTable('match_stats', {
    matchStatId: text('match_stat_id').primaryKey(), // Changed to text for consistency
    matchId: text('match_id')
        .references(() => matches.matchId),
    playerId: text('player_id')
        .references(() => players.playerId),
    kills: integer('kills').default(0),
    damage: integer('damage').default(0),
    assists: integer('assists').default(0),
    score: integer('score').default(0),
    rank: integer('rank').default(0),
    timeSurvived: integer('time_survived').default(0),
    teamId: integer('team_id').default(0),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Player Game Mode Stats table (aggregated stats by game mode)
export const playerGameModeStats = pgTable('player_game_mode_stats', {
    playerGameModeStatId: text('player_game_mode_stat_id').primaryKey(), // Changed to text for consistency
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
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Ranked Stats table (for ranked mode statistics)
export const playerRankedStats = pgTable('player_ranked_stats', {
    playerRankedStatId: text('player_ranked_stat_id').primaryKey(), // Changed to text for consistency
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
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
});