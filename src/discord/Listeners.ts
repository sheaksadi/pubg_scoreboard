import {Client, Presence, User, VoiceState} from "discord.js";
import {findOrCreateMemberFromUser, getOrSetMemberPlayerId} from "../db/member.js";

export class Listeners {
    private client: Client

    inChannelUsers: {
        [channelId: string]: {
            user: User;
            sessionId: string;
            joinTime: number;
        }[];
    }

    lastActivity: {
        [userId: string]: {
            activity: string;
            details: string;
            sessionId: string;
            startTime: number;
            timestamp: number;
        };
    }

    lastPubgActivity: {
        [userId: string]: {
            activity: string;
            details: string;
            mapName: string;
            gameMode: string;
            pubgId: string;
            sessionId: string;
            startTime: number;
            timestamp: number;
        };
    }

    constructor(client: Client) {
        this.client = client
        this.inChannelUsers = {}
        this.lastActivity = {}
        this.lastPubgActivity = {}
        this.initialize()
    }

    initialize() {
        this.client.on('presenceUpdate', this.presenceUpdate.bind(this));
        this.client.on('voiceStateUpdate', this.voiceChannelUpdate.bind(this));
    }

    async presenceUpdate(oldPresence: Presence, newPresence: Presence) {
        if (!newPresence.user) return;

        const userId = newPresence.user.id;

        // Only track users who are in voice channels
        if (!this.isUserInChannel(userId)) {
            return;
        }

        // Get current timestamp
        const currentTime = Date.now();

        // Find the user's channel session ID
        let channelSessionId = '';
        // Look through all channels to find this user
        for (const channelId in this.inChannelUsers) {
            const userEntry = this.inChannelUsers[channelId].find(entry => entry.user.id === userId);
            if (userEntry) {
                channelSessionId = userEntry.sessionId;
                break;
            }
        }

        // Process general activity first
        const currentActivity = newPresence.activities[0]; // Primary activity

        // Handle general activity tracking
        if (currentActivity) {
            // If there's a previous activity for this user
            if (this.lastActivity[userId]) {
                const lastAct = this.lastActivity[userId];

                // If activity name has changed, store the previous one
                if (lastAct.activity !== currentActivity.name) {
                    // Calculate duration
                    const duration = currentTime - lastAct.startTime;

                    // TODO: Store in database - memberActivities table
                    console.log(`Storing activity for ${userId}: ${lastAct.activity}, duration: ${duration}ms`);
                    // This is where you'd call your DB service to store the activity

                    // Update with new activity
                    this.lastActivity[userId] = {
                        activity: currentActivity.name,
                        details: currentActivity.details || '',
                        sessionId: channelSessionId, // Use channel session ID
                        startTime: currentTime,
                        timestamp: currentTime
                    };
                }
            } else {
                // First activity for this user
                this.lastActivity[userId] = {
                    activity: currentActivity.name,
                    details: currentActivity.details || '',
                    sessionId: channelSessionId, // Use channel session ID
                    startTime: currentTime,
                    timestamp: currentTime
                };
            }
        } else if (this.lastActivity[userId]) {
            // User has no activities now but had one before - they ended all activities
            const lastAct = this.lastActivity[userId];
            const duration = currentTime - lastAct.startTime;

            // TODO: Store in database - memberActivities table
            console.log(`Storing final activity for ${userId}: ${lastAct.activity}, duration: ${duration}ms`);
            // This is where you'd call your DB service to store the activity

            // Remove from tracking
            delete this.lastActivity[userId];
        }

        // Process PUBG activity specifically
        const pubgActivity = newPresence.activities.find(activity =>
            activity.applicationId === '530196305138417685'); // PUBG application ID

        // Handle PUBG activity tracking
        if (pubgActivity) {
            const pubgId = pubgActivity.party?.id?.split("-")[0] || '';

            await getOrSetMemberPlayerId(userId, pubgId);


            const isInGame = pubgActivity.details && pubgActivity.details !== 'In Lobby';
            const isInLobby = pubgActivity.details === 'In Lobby';

            // Extract game info if available
            let gameMode = '';
            let mapName = '';

            if (isInGame) {
                const details = pubgActivity.details || '';
                // Extract game mode and map name from details like "Normal, Erangel, 86/98"
                const parts = details.split(',');
                if (parts.length >= 2) {
                    gameMode = parts[0].trim();
                    mapName = parts[1].trim();
                }
            }

            // If we're already tracking PUBG for this user
            if (this.lastPubgActivity[userId]) {
                const lastPubg = this.lastPubgActivity[userId];

                // If player was in game but now in lobby (game ended)
                const wasInGame = lastPubg.details !== 'In Lobby' && lastPubg.mapName && lastPubg.gameMode;
                const wasInLobby = lastPubg.details === 'In Lobby';

                if (wasInGame && isInLobby) {
                    // Calculate duration
                    const duration = currentTime - lastPubg.startTime;

                    // TODO: Store in database - memberPubgActivities table
                    console.log(`Storing PUBG activity for ${userId}: ${lastPubg.mapName}, ${lastPubg.gameMode}, duration: ${duration}ms`);
                    // This is where you'd call your DB service to store the PUBG activity

                    // Update with new lobby status
                    this.lastPubgActivity[userId] = {
                        activity: pubgActivity.name,
                        details: pubgActivity.details || '',
                        mapName: '',
                        gameMode: '',
                        pubgId: pubgId,
                        sessionId: channelSessionId, // Use channel session ID
                        startTime: currentTime,
                        timestamp: currentTime
                    };
                }
                // Check if player went from lobby to game (new game started)
                else if (wasInLobby && isInGame) {
                    // Update with new game status
                    this.lastPubgActivity[userId] = {
                        activity: pubgActivity.name,
                        details: pubgActivity.details || '',
                        mapName: mapName,
                        gameMode: gameMode,
                        pubgId: pubgId,
                        sessionId: channelSessionId,
                        startTime: currentTime,
                        timestamp: currentTime
                    };
                }
            } else if (isInGame) {
                // First PUBG activity for this user and they're in game (not lobby)
                this.lastPubgActivity[userId] = {
                    activity: pubgActivity.name,
                    details: pubgActivity.details || '',
                    mapName: mapName,
                    gameMode: gameMode,
                    pubgId: pubgId,
                    sessionId: channelSessionId, // Use channel session ID
                    startTime: currentTime,
                    timestamp: currentTime
                };
            } else if (isInLobby) {
                // First PUBG activity for this user and they're in lobby
                this.lastPubgActivity[userId] = {
                    activity: pubgActivity.name,
                    details: pubgActivity.details || '',
                    mapName: '',
                    gameMode: '',
                    pubgId: pubgId,
                    sessionId: channelSessionId, // Use channel session ID
                    startTime: currentTime,
                    timestamp: currentTime
                };
            }
        } else if (this.lastPubgActivity[userId]) {
            // User was playing PUBG but isn't anymore
            const lastPubg = this.lastPubgActivity[userId];

            // Only log if they were in a game (not lobby)
            if (lastPubg.details !== 'In Lobby' && lastPubg.mapName && lastPubg.gameMode) {
                const duration = currentTime - lastPubg.startTime;

                // TODO: Store in database - memberPubgActivities table
                console.log(`Storing final PUBG activity for ${userId}: ${lastPubg.mapName}, ${lastPubg.gameMode}, duration: ${duration}ms`);
                // This is where you'd call your DB service to store the PUBG activity
            }

            // Remove from tracking
            delete this.lastPubgActivity[userId];
        }
    }

    isUserInChannel(userId: string): boolean {
        return Object.values(this.inChannelUsers).some(channelUsers =>
            channelUsers.some(entry => entry.user.id === userId)
        );
    }

    voiceChannelUpdate(oldState: VoiceState, newState: VoiceState) {
        console.log(`voiceStateUpdate triggered`);

        // User joined a voice channel
        if (!oldState.channelId && newState.channelId) {
            this.handleUserJoin(newState);
        }

        // User left a voice channel
        else if (oldState.channelId && !newState.channelId) {
            this.handleUserLeave(oldState);
        }

        // User switched channels
        else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            this.handleUserLeave(oldState);
            this.handleUserJoin(newState);
        }
    }

    private async handleUserJoin(state: VoiceState) {
        const user = state.member?.user;
        const channelId = state.channelId;

        if (!user || !channelId) return;

        let member = await findOrCreateMemberFromUser(user);


        if (!this.inChannelUsers[channelId]) {
            this.inChannelUsers[channelId] = [];
        }


        this.inChannelUsers[channelId].push({
            user: user,
            joinTime: Date.now(),
            sessionId: crypto.randomUUID()
        });

        console.log(`User ${user.tag} joined channel ${channelId}`);
    }

    private handleUserLeave(state: VoiceState) {
        const user = state.member?.user;
        const channelId = state.channelId;

        if (!user || !channelId || !this.inChannelUsers[channelId]) return;


        const userIndex = this.inChannelUsers[channelId].findIndex(entry => entry.user.id === user.id);

        if (userIndex !== -1) {
            const userEntry = this.inChannelUsers[channelId][userIndex];


            this.inChannelUsers[channelId].splice(userIndex, 1);


            const duration = this.calculateDuration(userEntry.joinTime, Date.now());

            console.log(`User ${user.tag} left channel ${channelId}`);


            this.handleUserDuration(user, channelId, duration, userEntry.sessionId);

            // Also clean up any activities when user leaves voice channel
            if (user.id && this.lastActivity[user.id]) {
                const lastAct = this.lastActivity[user.id];
                const duration = Date.now() - lastAct.startTime;

                // TODO: Store this final activity in the database
                console.log(`User left while in activity ${lastAct.activity}, duration: ${duration}ms`);

                delete this.lastActivity[user.id];
            }

            // Clean up PUBG activities too
            if (user.id && this.lastPubgActivity[user.id]) {
                const lastPubg = this.lastPubgActivity[user.id];

                // Only log if they were in a game (not lobby)
                if (lastPubg.details !== 'In Lobby' && lastPubg.mapName && lastPubg.gameMode) {
                    const duration = Date.now() - lastPubg.startTime;

                    // TODO: Store this final PUBG activity in the database
                    console.log(`User left during PUBG game on ${lastPubg.mapName}, ${lastPubg.gameMode}, duration: ${duration}ms`);
                }

                delete this.lastPubgActivity[user.id];
            }
        }
    }

    private calculateDuration(joinTime: number, leaveTime: number): number {
        return leaveTime - joinTime; // Duration in milliseconds
    }

    private handleUserDuration(user: User, channelId: string, durationMs: number, sessionId: string) {
        const durationSeconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(durationSeconds / 60);
        const seconds = durationSeconds % 60;

        console.log(`User ${user.tag} was in channel ${channelId} for ${minutes} minutes and ${seconds} seconds`);

        // TODO: Store the voice channel session in the database
        // Example:
        // await db.insert(discordChannelSessions).values({
        //     id: sessionId,
        //     channelId: channelId,
        //     guildId: state.guild?.id,
        //     memberId: user.id,
        //     duration: durationMs,
        // });
    }
}