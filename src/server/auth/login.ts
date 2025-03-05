import { DISCORD_CONFIG } from "../../config.js";

export function login(req, res) {
    const { state } = req.query; // Get custom parameter from request
    const discordAuthUrl = getDiscordAuthUrl(DISCORD_CONFIG.clientId, DISCORD_CONFIG.redirectUri, state);
    res.redirect(discordAuthUrl);
}

function getDiscordAuthUrl(clientId: string, redirectUri: string, state?: string) {
    const scope = encodeURIComponent('identify email');
    let url = `${process.env.BASE_URI_API}/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;

    if (state) {
        url += `&state=${encodeURIComponent(state)}`;
    }

    return url;
}