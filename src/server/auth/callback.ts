import express from "express";

import axios from "axios";

import jwt from "jsonwebtoken";
import {DISCORD_CONFIG, JWT_SECRET} from "../../config.js";



export async function callback(req, res) {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('Authorization code missing');
    }

    try {
        // Exchange the authorization code for an access token
        const tokenResponse = await axios.post(`${process.env.BASE_URI_API}/api/oauth2/token`, new URLSearchParams({
            client_id: DISCORD_CONFIG.clientId,
            client_secret: DISCORD_CONFIG.clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: DISCORD_CONFIG.redirectUri
        }).toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token } = tokenResponse.data;

        // Fetch the user's data using the access token
        const userResponse = await axios.get(`${process.env.BASE_URI_API}/api/users/@me`, {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const user = userResponse.data;

        user.avatar = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=512`

        // Generate a JWT token for the session
        const token = jwt.sign({ user }, JWT_SECRET, { expiresIn: '1h' });

        // Set the session cookie
        res.cookie('session', token, {
            httpOnly: true,
            maxAge: 3600 * 1000, // 1 hour in milliseconds
            path: '/',
            sameSite: 'lax',     // Use 'lax' to allow cross-site requests in specific scenarios
            secure: process.env.NODE_ENV === 'production',
            // domain: process.env.COOKIE_DOMAIN || 'localhost' // Add this to work across subdomains/ports
        });


        // Redirect the user to the home page
        res.redirect('http://localhost:3000/');
    } catch (error) {
        console.error(error);
        res.status(500).send('OAuth2 Failed');
    }
}