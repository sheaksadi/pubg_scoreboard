import {client, db, DISCORD_GUILD_ID} from './../config.js'; // Your database client
import {discordUsers, members} from './schema.js'; // Import your schema
import {User} from 'discord.js';
import {eq} from "drizzle-orm"; // Import the Discord-provided user type
import {InferInsertModel} from 'drizzle-orm';
import {guild} from "../index.js"; // Import the correct type


// Define the type for the insert values

export type DiscordUserInsert = {
    id: string;
    username: string;
    avatar?: string | null;
    roles: {
        name: string;
        color: string;
        id: string;
    }[]
    discriminator?: string | null;
    public_flags?: number | null;
    flags?: number | null;
    banner?: string | null;
    accent_color?: number | null;
    global_name?: string | null;
    avatar_decoration_data?: string | null;
    banner_color?: string | null;
    email?: string | null;
    createdAt?: Date | null;
};


export async function findOrCreateDiscordUser(discordUser: User, roles: {
    name: string;
    color: string;
    id: string;
}[] = []) {
    // Check if the user already exists
    let user = await db.select().from(discordUsers).where(eq(discordUsers.id, discordUser.id));

    if (user.length === 0) {

        // Create a properly typed object for insert
        const newUser: DiscordUserInsert = {
            id: discordUser.id,
            username: discordUser.username,
            roles,
            // Add optional fields with null fallbacks
            avatar: discordUser.avatar || null,
            discriminator: discordUser.discriminator || null,
            public_flags: discordUser.flags?.bitfield || null,
            flags: discordUser.flags?.bitfield || null,
            banner: discordUser.banner || null,
            accent_color: discordUser.accentColor || null,
            global_name: discordUser.globalName || null,
            avatar_decoration_data: discordUser.avatarDecoration || null,
            banner_color: discordUser.hexAccentColor || null,
            email: null,
        };

        // Insert with the properly typed object
        const result = await db.insert(discordUsers).values(newUser).returning();
        return result[0];
    }

    return user[0];
}

export async function setNickName(discordId: string, name: string) {
    await db.update(members).set({nickname: name}).where(eq(members.discordId, discordId)).returning();
}




export async function findOrCreateMemberFromUser(discordUser: User){
    let roles = []
    let member = await guild.members.fetch(discordUser.id)
    for (let [id, r] of member.roles.cache){
        roles.push({
            name: r.name,
            id: id,
            color: r.color.toString(16).padStart(6, '0')
        })
    }
    let user = await findOrCreateDiscordUser(discordUser, roles);
    return await findOrCreateMember(user.id);
}

export async function findDiscordUser(id: string) {
    return (await db.select().from(discordUsers).where(eq(discordUsers.id, id)))[0];
}

export async function createMember(discordId: string, playerId?: string) {
    return (await db.insert(members).values({playerId, discordId}).returning())[0];
}

export async function getOrSetMemberPlayerId(discordId: string, playerId?: string) {
    const member = await db.select().from(members).where(eq(members.discordId, discordId));

    if (member.length === 0) {
        return createMember(discordId, playerId);
    }
    if (member[0].playerId === null) {
        await db.update(members).set({playerId}).where(eq(members.discordId, discordId)).returning();
    }

    return member[0];

}

export async function findOrCreateMember(discordId: string, playerId?: string) {
    let member = await db.select().from(members).where(eq(members.discordId, discordId));

    if (member.length === 0) {
        return createMember(discordId, playerId);
    }
    return member[0];
}

