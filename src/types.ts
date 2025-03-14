export interface MatchData {
    data: {
        type: "match";
        id: string;
        attributes: {
            createdAt: string;
            duration: number;
            matchType: string;
            gameMode: string;
            mapName: string;
            isCustomMatch: boolean;
            seasonState: string;
            stats: null;
            tags: null;
            titleId: string;
        };
        relationships: {
            rosters: {
                data: Array<{ type: "roster"; id: string; }>;
            };
            assets: {
                data: Array<{ type: "asset"; id: string; }>;
            };
        };
    };
    included: (Participant | Roster | Asset)[];
}

export interface Participant {
    type: "participant";
    id: string;
    attributes: {
        actor: string;
        shardId: string;
        stats: {
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
    };
}

export interface Roster {
    type: "roster";
    id: string;
    attributes: {
        stats: {
            rank: number;
            teamId: number;
        };
        won: string;
        shardId: string;
    };
    relationships: {
        team: {
            data: null;
        };
        participants: {
            data: Array<{ type: "participant"; id: string; }>;
        };
    };
}

export interface Asset {
    type: "asset";
    id: string;
    attributes: {
        URL: string;
        createdAt: string;
        description: string;
        name: string;
    };
}

export interface Team extends Roster {
    players: TeamMember[];
}

export interface TeamMember extends Participant {
    MVPScore: number;
}



export type PlayerResponse = {
    data: {
        type: string;
        id: string;
        attributes: {
            stats: null;
            titleId: string;
            shardId: string;
            patchVersion: string;
            banType: string;
            clanId: string;
            name: string;
        };
        relationships: {
            assets: {
                data: Array<any>;
            };
            matches: {
                data: Array<{
                    type: string;
                    id: string;
                }>;
            };
        };
        links: {
            self: string;
            schema: string;
        };
    }[];
    links: {
        self: string;
    };
    meta: Record<string, never>;
}






export interface PlayerSeasonData {
    data: {
        type: string;
        attributes: {
            gameModeStats: {
                duo: GameModeStats;
                "duo-fpp": GameModeStats;
                solo: GameModeStats;
                "solo-fpp": GameModeStats;
                squad: GameModeStats;
                "squad-fpp": GameModeStats;
            };
            bestRankPoint: number;
        };
        relationships: {
            player: {
                data: {
                    type: string;
                    id: string;
                };
            };
            matchesSolo: {
                data: Match[];
            };
            matchesSoloFPP: {
                data: Match[];
            };
            matchesDuo: {
                data: Match[];
            };
            matchesDuoFPP: {
                data: Match[];
            };
            matchesSquad: {
                data: Match[];
            };
            matchesSquadFPP: {
                data: Match[];
            };
            season: {
                data: {
                    type: string;
                    id: string;
                };
            };
        };
        links: {
            self: string;
        };
        meta: Record<string, unknown>;
    };
}

export interface RankedPlayerStats {
    data: {
        type: string;
        attributes: {
            rankedGameModeStats: {
                squad: RankedGameModeStats;
                "squad-fpp": RankedGameModeStats;
            };
        };
        relationships: {
            player: {
                data: {
                    type: string;
                    id: string;
                };
            };
            season: {
                data: {
                    type: string;
                    id: string;
                };
            };
        };
        links: {
            self: string;
        };
        meta: Record<string, unknown>;
    };
}

export interface GameModeStats {
    assists: number;
    boosts: number;
    dBNOs: number;
    dailyKills: number;
    dailyWins: number;
    damageDealt: number;
    days: number;
    headshotKills: number;
    heals: number;
    killPoints: number;
    kills: number;
    longestKill: number;
    longestTimeSurvived: number;
    losses: number;
    maxKillStreaks: number;
    mostSurvivalTime: number;
    rankPoints: number;
    rankPointsTitle: string;
    revives: number;
    rideDistance: number;
    roadKills: number;
    roundMostKills: number;
    roundsPlayed: number;
    suicides: number;
    swimDistance: number;
    teamKills: number;
    timeSurvived: number;
    top10s: number;
    vehicleDestroys: number;
    walkDistance: number;
    weaponsAcquired: number;
    weeklyKills: number;
    weeklyWins: number;
    winPoints: number;
    wins: number;
}

export interface RankedGameModeStats {
    currentTier: {
        tier: string;
        subTier: string;
    };
    currentRankPoint: number;
    bestTier: {
        tier: string;
        subTier: string;
    };
    bestRankPoint: number;
    roundsPlayed: number;
    avgRank: number;
    avgSurvivalTime: number;
    top10Ratio: number;
    winRatio: number;
    assists: number;
    wins: number;
    kda: number;
    kdr: number;
    kills: number;
    deaths: number;
    roundMostKills: number;
    longestKill: number;
    headshotKills: number;
    headshotKillRatio: number;
    damageDealt: number;
    dBNOs: number;
    reviveRatio: number;
    revives: number;
    heals: number;
    boosts: number;
    weaponsAcquired: number;
    teamKills: number;
    playTime: number;
    killStreak: number;
}

export interface Match {
    type: string;
    id: string;
}


// src/types/ChannelSession.ts
import { User } from "discord.js";

export interface ChannelSession {
    user: User;
    sessionId: string;
    joinTime: number;
}

// src/types/ActivityData.ts
export interface ActivityData {
    activity: string;
    details: string;
    sessionId: string;
    startTime: number;
    timestamp: number;
}

// src/types/PubgActivityData.ts
export interface PubgActivityData {
    activity: string;
    details: string;
    mapName: string;
    gameMode: string;
    pubgId: string;
    sessionId: string;
    startTime: number;
    timestamp: number;
}