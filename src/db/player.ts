import {eq, sql} from "drizzle-orm";
import {players} from "./schema.js";
import {db} from './../config.js';

export const checkPlayerExistsId = async (id: string) => {
    try {
        const result = await db.select()
            .from(players)
            .where(eq(players.playerId, id));

        return {
            exists: result.length > 0,
            player: result.length > 0 ? result[0] : null
        };

    } catch (error) {
        console.error('Error checking player:', error);
        throw error;
    }
};

export const getPlayers = () => {
    return db.select().from(players)
};

