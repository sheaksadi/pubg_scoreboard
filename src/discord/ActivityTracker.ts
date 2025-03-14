// src/listeners/ActivityTracker.ts
import {VoiceChannelTracker} from "./VCTracker.js";
import {ActivityData} from "../types.js";
import {findOrCreateMember} from "../db/member.js";
import {insertActivity} from "../db/activity.js";
import {db} from "../config.js";
import {ChannelType, Client, GuildMember, VoiceChannel} from "discord.js";

export class ActivityTracker {
    private lastActivity: {
        [userId: string]: ActivityData;
    };
    private voiceChannelTracker: VoiceChannelTracker;

    constructor(voiceChannelTracker: VoiceChannelTracker) {
        this.lastActivity = {};
        this.voiceChannelTracker = voiceChannelTracker;
    }

    getCurrentActivity(member: GuildMember): string {
        // Check if the member has an activity (e.g., playing a game, streaming)
        const activity = member.presence?.activities[0]?.name;

        return activity || ""; // If no activity, default to "Black"
    }


    async initialize(client: Client) {
        let channels = client.channels.cache
            .filter(channel => channel.type === ChannelType.GuildVoice)
            .map(channel => channel as VoiceChannel);

        channels.forEach(channel => {
            let members = channel.members;
            for (const member of members.values()) {
                const currentActivity = this.getCurrentActivity(member);
                this.lastActivity[member.id] = {
                    activity: currentActivity,
                    details: "",
                    sessionId: this.voiceChannelTracker.getUserSessionId(member.id),
                    startTime: Date.now(),
                    timestamp: Date.now()
                };
            }
        });
    }

    processActivityUpdate(userId: string, channelSessionId: string, currentTime: number, activity: any) {
        if (!activity) {
            this.handleActivityEnd(userId, currentTime);
            return;
        }

        if (this.lastActivity[userId]) {
            this.handleActivityChange(userId, channelSessionId, currentTime, activity);
        } else {
            this.startNewActivityTracking(userId, channelSessionId, currentTime, activity);
        }
    }

    private handleActivityChange(userId: string, channelSessionId: string, currentTime: number, activity: any) {
        const lastAct = this.lastActivity[userId];

        // If activity name has changed, store the previous one
        if (lastAct.activity !== activity.name) {
            // Calculate duration
            const duration = currentTime - lastAct.startTime;
            const details = lastAct.details || "";
            // Store completed activity
            this.storeActivityData(userId, lastAct.activity, duration, details);

            // Update with new activity
            this.lastActivity[userId] = {
                activity: activity.name,
                details: activity.details || '',
                sessionId: channelSessionId,
                startTime: currentTime,
                timestamp: currentTime
            };
        }
    }

    private startNewActivityTracking(userId: string, channelSessionId: string, currentTime: number, activity: any) {
        this.lastActivity[userId] = {
            activity: activity.name,
            details: activity.details || '',
            sessionId: channelSessionId,
            startTime: currentTime,
            timestamp: currentTime
        };
    }

    private handleActivityEnd(userId: string, currentTime: number) {
        if (this.lastActivity[userId]) {
            const lastAct = this.lastActivity[userId];
            const duration = currentTime - lastAct.startTime;
            const details = lastAct.details || '';
            // Store the final activity
            this.storeActivityData(userId, lastAct.activity, duration, details);

            // Remove from tracking
            delete this.lastActivity[userId];
        }
    }

    cleanupUserActivity(userId: string) {
        if (this.lastActivity[userId]) {
            const lastAct = this.lastActivity[userId];
            const duration = Date.now() - lastAct.startTime;
            const details = lastAct.details || '';
            // Store this final activity in the database
            this.storeActivityData(userId, lastAct.activity, duration, details);

            delete this.lastActivity[userId];
        }
    }

    private storeActivityData(userId: string, activityName: string, duration: number, details: string) {
        console.log(`Storing activity for ${userId}: ${activityName}, duration: ${duration}ms`);
        let sessionId = this.voiceChannelTracker.getUserSessionId(userId);
        findOrCreateMember(userId).then(async (member) => {
            await insertActivity(db, member.id, sessionId, activityName, details, duration);

        })
    }

}