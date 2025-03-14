
import {discordChannelSessions, memberActivities, memberPubgActivities, members} from "./schema.js";

export async function insertVCActivity(db: any, sessionId: string, channelId: string, memberId: number, duration: number ) {
    type DiscordSession = typeof discordChannelSessions.$inferInsert

    let newInsert: DiscordSession = {
        id: sessionId,
        channelId: channelId,
        memberId: memberId,
        duration: duration || 0,
    }
    return db.insert(discordChannelSessions).values(newInsert).returning()
}


export async function insertActivity(db: any, memberId: number, sessionId: string, activity: string, details: string, duration: number ) {
    await db.insert(memberActivities).values({
        memberId: memberId,
        sessionId: sessionId,
        activity: activity,
        details: details,
        duration: duration,
    }).returning()

}

export async function insertPubgActivity(db: any, memberId: number, sessionId: string, gameMode: string, mapName: string, details: string, duration: number ) {
    await db.insert(memberPubgActivities).values({
        memberId: memberId,
        sessionId: sessionId,
        gameMode: gameMode,
        mapName: mapName,
        details: details,
        duration: duration,
    }).returning()


}
