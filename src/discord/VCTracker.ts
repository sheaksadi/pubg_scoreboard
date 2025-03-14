// src/listeners/VoiceChannelTracker.ts
import {Client, User, VoiceState, ChannelType, VoiceChannel} from "discord.js";
import { findOrCreateMemberFromUser } from "../db/member.js";
import { ActivityTracker } from "./ActivityTracker.js";
import { PubgActivityTracker } from "./PubgActivityTracker.js";
import { ChannelSession } from "../types.js";
import {insertVCActivity} from "../db/activity.js";
import {db} from "../config.js";

export class VoiceChannelTracker {
    private inChannelUsers: {
        [channelId: string]: ChannelSession[];
    };

    constructor() {
        this.inChannelUsers = {};
    }

    async initialize(client: Client) {
        let channels = client.channels.cache
            .filter(channel => channel.type === ChannelType.GuildVoice) // Correct type check
            .map(channel => channel as VoiceChannel); // Ensure it's a VoiceChannel

        channels.forEach(channel => {
            let members = channel.members; // Works because it's a VoiceChannel
            this.inChannelUsers[channel.id] = [];
            for (const member of members.values()) {
                this.inChannelUsers[channel.id].push({
                    user: member.user,
                    joinTime: Date.now(),
                    sessionId: crypto.randomUUID()
                });
                console.log(`User ${member.user.tag} was in channel ${channel.id}`);
            }
        });
    }

    async handleVoiceStateUpdate(
        oldState: VoiceState,
        newState: VoiceState,
        activityTracker: ActivityTracker,
        pubgActivityTracker: PubgActivityTracker
    ) {
        console.log("voiceStateUpdate triggered");

        // User joined a voice channel
        if (!oldState.channelId && newState.channelId) {
            await this.handleUserJoin(newState);
        }
        // User left a voice channel
        else if (oldState.channelId && !newState.channelId) {
            this.handleUserLeave(oldState, activityTracker, pubgActivityTracker);
        }
        // User switched channels
        else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            this.handleUserLeave(oldState, activityTracker, pubgActivityTracker);
            await this.handleUserJoin(newState);
        }
    }

    async handleUserJoin(state: VoiceState) {
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

    handleUserLeave(
        state: VoiceState,
        activityTracker: ActivityTracker,
        pubgActivityTracker: PubgActivityTracker
    ) {
        const user = state.member?.user;
        const channelId = state.channelId;

        if (!user || !channelId || !this.inChannelUsers[channelId]) return;

        const userIndex = this.inChannelUsers[channelId].findIndex(entry => entry.user.id === user.id);

        if (userIndex !== -1) {
            const userEntry = this.inChannelUsers[channelId][userIndex];
            this.inChannelUsers[channelId].splice(userIndex, 1);

            const duration = this.calculateDuration(userEntry.joinTime, Date.now());
            console.log(`User ${user.tag} left channel ${channelId}`);

            this.storeUserSession(user, channelId, duration, userEntry.sessionId);

            // Clean up user activities when leaving voice channel
            if (user.id) {
                activityTracker.cleanupUserActivity(user.id);
                pubgActivityTracker.cleanupUserPubgActivity(user.id);
            }
        }
    }

    isUserInChannel(userId: string): boolean {
        return Object.values(this.inChannelUsers).some(channelUsers =>
            channelUsers.some(entry => entry.user.id === userId)
        );
    }

    getUserSessionId(userId: string): string {
        for (const channelId in this.inChannelUsers) {
            const userEntry = this.inChannelUsers[channelId].find(entry => entry.user.id === userId);
            if (userEntry) {
                return userEntry.sessionId;
            }
        }
        return '';
    }

    private calculateDuration(joinTime: number, leaveTime: number): number {
        return leaveTime - joinTime; // Duration in milliseconds
    }

    private storeUserSession(user: User, channelId: string, durationMs: number, sessionId: string) {
        const durationSeconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(durationSeconds / 60);
        const seconds = durationSeconds % 60;

        findOrCreateMemberFromUser(user).then(async (member) => {
            console.log("trying to insert")
            console.log(await insertVCActivity(db ,sessionId, channelId, member.id, durationSeconds))
        });
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
    private getSession(userId: string) {
        for (let [key, value] of Object.entries(this.inChannelUsers)) {
            for (const val of value){
                if (val.user.id === userId) {
                    return val.sessionId;
                }
            }
        }
    }
}