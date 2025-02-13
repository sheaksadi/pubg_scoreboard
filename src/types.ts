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
    data: Array<{
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
    }>;
    links: {
        self: string;
    };
    meta: Record<string, never>;
}