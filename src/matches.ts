import { API_KEY } from './config.js';
import axios from 'axios';
import {getData} from "./api.js";

export async function getLastMatches(playerName: string, count: number = 1): Promise<any[]> {
    const api = axios.create({
        baseURL: 'https://api.pubg.com/shards/',
        headers: {
            'Authorization': `Bearer ${API_KEY.trim()}`,
            'Accept': 'application/vnd.api+json'
        }
    });

    const data = await api.get('steam/players', {
        params: {
            'filter[playerNames]': playerName
        }
    });

    const matches = data.data.data[0].relationships.matches.data;
    return matches.slice(0, count);
}

export async function getLastCustomGame(matches: any[]): Promise<string | undefined> {
    for (const match of matches) {
        const matchId = match.id;
        try {
            const matchData = await getData(matchId);
            if (matchData.data.attributes.matchType === 'custom') {
                return matchId;
            }
        } catch (error) {
            console.log(`Failed to get match id ${matchId}`);
        }
    }
}