// api.ts
import axios from 'axios';
import {MatchData, PlayerResponse, PlayerSeasonData, RankedPlayerStats} from './types.js';
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
const seasonalLimiter = new RateLimiter({
    tokensPerInterval: 1,
    interval: 1000 * 60,
    fireImmediately: false
})
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
export async function getPlayerDataFromId(id: string) :Promise<PlayerResponse>{
    try {
        // Wait for rate limiter to allow the request
        await limiter.removeTokens(1);

        const response =  await api.get('steam/players', {
            params: {
                'filter[playerIds]': id
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


export async function getPlayerSeasonData(playerAccountId: string, seasonId: string): Promise<PlayerSeasonData> {
    await seasonalLimiter.removeTokens(1);
    try {
        const response = await api.get(`steam/players/${playerAccountId}/seasons/${seasonId}`);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching player season data:', error.message);
        } else {
            console.error('Error fetching player season data:', error);
        }
        throw error;
    }
}

export async function getPlayerSeasonRankedData(playerAccountId: string, seasonId: string): Promise<RankedPlayerStats> {
    await seasonalLimiter.removeTokens(1);
    try {
        const response = await api.get(`steam/players/${playerAccountId}/seasons/${seasonId}/ranked`);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching player season data:', error.message);
        } else {
            console.error('Error fetching player season data:', error);
        }
        throw error;
    }
}






