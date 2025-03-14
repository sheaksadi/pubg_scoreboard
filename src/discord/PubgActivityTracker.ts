// src/listeners/PubgActivityTracker.ts
import { VoiceChannelTracker } from "./VCTracker.js";
import { PubgActivityData } from "../types.js";
import {findOrCreateMember, getOrSetMemberPlayerId} from "../db/member.js";
import {checkPlayerExists, createPlayer} from "../db/schema_old.js";
import {db} from "../config.js";
import {checkPlayerExistsId} from "../db/player.js";
import {getPlayerDataFromId} from "../api.js";
import {insertActivity, insertPubgActivity} from "../db/activity.js";

export class PubgActivityTracker {
    private lastPubgActivity: {
        [userId: string]: PubgActivityData;
    };
    private voiceChannelTracker: VoiceChannelTracker;

    constructor(voiceChannelTracker: VoiceChannelTracker) {
        this.lastPubgActivity = {};
        this.voiceChannelTracker = voiceChannelTracker;
    }

    async processPubgActivity(userId: string, channelSessionId: string, currentTime: number, activity: any) {
        if (!activity) {
            this.handlePubgActivityEnd(userId, currentTime);
            return;
        }

        const pubgId = activity.party?.id?.split("-")[0] || '';

        const isInGame = activity.details && activity.details !== 'In Lobby';
        const isInLobby = activity.details === 'In Lobby';

        // Extract game info
        const gameInfo = this.extractGameInfo(activity.details, isInGame);

        if (this.lastPubgActivity[userId]) {
            this.handleExistingPubgActivity(
                userId,
                channelSessionId,
                currentTime,
                activity,
                pubgId,
                isInGame,
                isInLobby,
                gameInfo
            );
        } else {
            this.startNewPubgTracking(
                userId,
                channelSessionId,
                currentTime,
                activity,
                pubgId,
                isInGame,
                isInLobby,
                gameInfo
            );
        }
    }

    private extractGameInfo(details: string, isInGame: boolean) {
        let gameMode = '';
        let mapName = '';

        if (isInGame && details) {
            const parts = details.split(',');
            if (parts.length >= 2) {
                gameMode = parts[0].trim();
                mapName = parts[1].trim();
            }
        }
        return { gameMode, mapName };
    }

    private handleExistingPubgActivity(
        userId: string,
        channelSessionId: string,
        currentTime: number,
        activity: any,
        pubgId: string,
        isInGame: boolean,
        isInLobby: boolean,
        gameInfo: { gameMode: string, mapName: string }
    ) {
        const lastPubg = this.lastPubgActivity[userId];

        // Check for state transitions
        const wasInGame = lastPubg.details !== 'In Lobby' && lastPubg.mapName && lastPubg.gameMode;
        const wasInLobby = lastPubg.details === 'In Lobby';

        // Transition: Game to Lobby (game ended)
        if (wasInGame && isInLobby) {
            this.handleGameToLobbyTransition(userId, channelSessionId, currentTime, activity, pubgId);
        }
        // Transition: Lobby to Game (new game started)
        else if (wasInLobby && isInGame) {
            this.handleLobbyToGameTransition(
                userId,
                channelSessionId,
                currentTime,
                activity,
                pubgId,
                gameInfo.mapName,
                gameInfo.gameMode
            );
        }
    }

    private handleGameToLobbyTransition(
        userId: string,
        channelSessionId: string,
        currentTime: number,
        activity: any,
        pubgId: string
    ) {
        const lastPubg = this.lastPubgActivity[userId];
        const duration = currentTime - lastPubg.startTime;

        // Store completed game session
        this.storePubgActivity(userId, lastPubg.mapName, lastPubg.gameMode, duration, lastPubg.details);

        // Update to lobby status
        this.lastPubgActivity[userId] = {
            activity: activity.name,
            details: activity.details || '',
            mapName: '',
            gameMode: '',
            pubgId: pubgId,
            sessionId: channelSessionId,
            startTime: currentTime,
            timestamp: currentTime
        };
    }

    private handleLobbyToGameTransition(
        userId: string,
        channelSessionId: string,
        currentTime: number,
        activity: any,
        pubgId: string,
        mapName: string,
        gameMode: string
    ) {
        // Update with new game status
        this.lastPubgActivity[userId] = {
            activity: activity.name,
            details: activity.details || '',
            mapName: mapName,
            gameMode: gameMode,
            pubgId: pubgId,
            sessionId: channelSessionId,
            startTime: currentTime,
            timestamp: currentTime
        };
    }

    private startNewPubgTracking(
        userId: string,
        channelSessionId: string,
        currentTime: number,
        activity: any,
        pubgId: string,
        isInGame: boolean,
        isInLobby: boolean,
        gameInfo: { gameMode: string, mapName: string }
    ) {
        this.lastPubgActivity[userId] = {
            activity: activity.name,
            details: activity.details || '',
            mapName: isInGame ? gameInfo.mapName : '',
            gameMode: isInGame ? gameInfo.gameMode : '',
            pubgId: pubgId,
            sessionId: channelSessionId,
            startTime: currentTime,
            timestamp: currentTime
        };
    }

    private handlePubgActivityEnd(userId: string, currentTime: number) {
        if (this.lastPubgActivity[userId]) {
            const lastPubg = this.lastPubgActivity[userId];

            // Only log if they were in a game (not lobby)
            if (lastPubg.details !== 'In Lobby' && lastPubg.mapName && lastPubg.gameMode) {
                const duration = currentTime - lastPubg.startTime;
                this.storePubgActivity(userId, lastPubg.mapName, lastPubg.gameMode, duration, lastPubg.details);
            }

            // Remove from tracking
            delete this.lastPubgActivity[userId];
        }
    }

    cleanupUserPubgActivity(userId: string) {
        if (this.lastPubgActivity[userId]) {
            const lastPubg = this.lastPubgActivity[userId];

            // Only log if they were in a game (not lobby)
            if (lastPubg.details !== 'In Lobby' && lastPubg.mapName && lastPubg.gameMode) {
                const duration = Date.now() - lastPubg.startTime;
                this.storePubgActivity(userId, lastPubg.mapName, lastPubg.gameMode, duration, lastPubg.details);
            }
            delete this.lastPubgActivity[userId];
        }
    }

    private storePubgActivity(userId: string, mapName: string, gameMode: string, duration: number, details: string) {
        console.log(`Storing PUBG activity for ${userId}: ${mapName}, ${gameMode}, duration: ${duration}ms`);
        let sessionId = this.voiceChannelTracker.getUserSessionId(userId);
        findOrCreateMember(userId).then(async (member)=> {
            await insertPubgActivity(db, member.id, sessionId, gameMode, mapName, details, duration);
        })
    }

}