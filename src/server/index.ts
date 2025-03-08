import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import {getTopPlayers} from "../db/schema_old.js";
import {db} from "../config.js";
import {auth} from "./auth/auth.js";
import cookieParser from "cookie-parser";
// import {getOrganizedGameModeStats, getOrganizedRankedStats} from "../db/seasonalStats.js";

export function main() {
    const app = express();

    app.use(cors({
        origin: 'http://localhost:3000', // Your frontend URL
        credentials: true // Important for cookies
    }));
    app.use(cookieParser());
    const server = createServer(app);

    auth(app);

    app.get('/', (req, res) => {
        res.send('Hello, World!');
    });

    app.get('/scrims',async (req, res) => {
        //
        // let topPlayers =await getTopPlayers(db, 100);
        // let con = convertStats(topPlayers)
        // console.log(con)
        // res.send(con);
    });

    app.get('/seasonal',async (req, res) => {
        // let data = await getOrganizedGameModeStats(db)
        // res.send(data);
    })
    app.get('/seasonalRanked',async (req, res) => {
        // let data = await getOrganizedRankedStats(db)
        // res.send(data);
    })


    server.listen(3100, () => {
        console.log('Server started on port 3100');
    });

}
