// api.ts
import axios from 'axios';
import { MatchData } from './types.js';
import {API_KEY} from "./config.js";

const api = axios.create({
    baseURL: 'https://api.pubg.com/shards/',
    headers: {
        'Authorization': `Bearer ${API_KEY?.trim()}`,
        'Accept': 'application/vnd.api+json'
    }
});

export async function getData(matchId: string): Promise<MatchData> {
    const options = {
        method: 'GET',
        url: `https://api.pubg.com/shards/steam/matches/${matchId}`,
        headers: { Accept: 'application/vnd.api+json' }
    };

    const res = await axios.request(options);
    return res.data;
}

export async function getPlayerData(playerName: string) {
    try {
        const response = await api.get('steam/players', {
            params: {
                'filter[playerNames]': playerName
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching player data:', error);
        throw error;
    }
}
