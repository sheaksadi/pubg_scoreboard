// api.ts
import axios from 'axios';
import {MatchData, PlayerResponse} from './types.js';
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

import { RateLimiter } from 'limiter';

// Create a rate limiter that allows 5 requests per second
const limiter = new RateLimiter({
    tokensPerInterval: 5,
    interval: 1000 * 60, // 1 second
    fireImmediately: false
});

export async function getPlayerData(playerName: string): Promise<PlayerResponse> {
    try {
        // Wait for rate limiter to allow the request
        await limiter.removeTokens(1);

        const response = await api.get('steam/players', {
            params: {
                'filter[playerNames]': playerName
            }
        });
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching player data:', error.message);
        } else {
            console.error('Error fetching player data:', error);
        }
        throw error;
    }
}