// src/listeners/Listeners.ts
import {Client, Guild, Presence} from "discord.js";
import {ActivityTracker} from "./ActivityTracker.js";
import {PubgActivityTracker} from "./PubgActivityTracker.js";
import {VoiceChannelTracker} from "./VCTracker.js";
import {checkPlayerExistsId} from "../db/player.js";
import {getPlayerDataFromId} from "../api.js";
import {createPlayer} from "../db/schema_old.js";
import {client, db, DISCORD_GUILD_ID} from "../config.js";
import {
    findOrCreateMemberFromUser,
    getOrSetMemberPlayerId,
    setNickName
} from "../db/member.js";
import {startPresence} from "./Presence.js";
import {guild} from "../index.js";

export class Listeners {
    private client: Client;
    private activityTracker: ActivityTracker;
    private pubgActivityTracker: PubgActivityTracker;
    private voiceChannelTracker: VoiceChannelTracker;

    private queuedUpAccounts = []

    constructor(client: Client) {
        this.client = client;
        this.voiceChannelTracker = new VoiceChannelTracker();
        this.activityTracker = new ActivityTracker(this.voiceChannelTracker);
        this.pubgActivityTracker = new PubgActivityTracker(this.voiceChannelTracker);
        this.initialize();
    }

    initialize() {
        this.client.on('presenceUpdate', this.handlePresenceUpdate.bind(this));
        this.client.on('voiceStateUpdate', this.handleVoiceStateUpdate.bind(this));
        this.client.on('ready', this.handleReady.bind(this));
    }

    private async handleReady(client: Client) {
        startPresence(client)
        await this.voiceChannelTracker.initialize(client)
        await this.activityTracker.initialize(client)


        if (!guild) return;

        let guildMembers = await guild.members.fetch()
        for (const guildMember of guildMembers.values()) {
            console.log(guildMember.user.displayName)
            let member = await findOrCreateMemberFromUser(guildMember.user);
            if (member.nickname === null) {
                await setNickName(guildMember.user.id, guildMember.displayName)
            }
        }
        console.log("finished setting users")
    }

    private async handlePresenceUpdate(oldPresence, newPresence: Presence) {
        if (!newPresence.user) return;
        const pubgActivity = newPresence.activities.find(activity =>
            activity.applicationId === '530196305138417685');


        if (pubgActivity) {

            let member = await findOrCreateMemberFromUser(newPresence.user);


            const pubgId = pubgActivity.party?.id?.split("-")[0] || '';
            console.log(pubgId, "oubg")
            let playerExists = await checkPlayerExistsId(pubgId)

            if (!playerExists.exists && !this.queuedUpAccounts.includes(pubgId) && pubgId.startsWith("account.")) {
                this.queuedUpAccounts.push(pubgId);
                let player = await getPlayerDataFromId(pubgId)
                console.log(player)

                let name = player.data[0].attributes.name
                playerExists = await checkPlayerExistsId(pubgId)
                if (!playerExists.exists) {
                    await createPlayer(db, name, pubgId)
                }
                this.queuedUpAccounts = this.queuedUpAccounts.filter(account => account.id !== pubgId);
            }

            playerExists = await checkPlayerExistsId(pubgId)
            console.log(playerExists.player?.playerId)
            if (playerExists.exists && member.playerId === null) {
                console.log("adding player id", newPresence.user.id);
                await getOrSetMemberPlayerId(newPresence.user.id, pubgId);
            }

        }


        const userId = newPresence.user.id;

        // Only track users who are in voice channels
        if (!this.voiceChannelTracker.isUserInChannel(userId)) {
            return;
        }

        const channelSessionId = this.voiceChannelTracker.getUserSessionId(userId);
        const currentTime = Date.now();

        // Track general activity
        this.activityTracker.processActivityUpdate(
            userId,
            channelSessionId,
            currentTime,
            newPresence.activities[0]
        );

        // Track PUBG specific activity
        this.pubgActivityTracker.processPubgActivity(
            userId,
            channelSessionId,
            currentTime,
            pubgActivity
        );
    }

    private handleVoiceStateUpdate(oldState, newState) {
        this.voiceChannelTracker.handleVoiceStateUpdate(
            oldState,
            newState,
            this.activityTracker,
            this.pubgActivityTracker
        );
    }
}