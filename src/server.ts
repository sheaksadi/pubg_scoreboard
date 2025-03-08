import express from 'express';
import { createServer } from 'http';
import cors from 'cors';

import {checkPlayerExists, createPlayer, getTopPlayers} from "./db/schema_old.js";
import {db} from "./config.js";
import {getPlayerData, getPlayerSeasonData, getPlayerSeasonRankedData} from "./api.js";
import {
    getOrganizedGameModeStats, getOrganizedRankedStats,
    transformPlayerSeasonData,
    transformRankedPlayerStats,
    upsertPlayerGameModeStats, upsertPlayerRankedStats
} from "./db/seasonalStats.js";


const app = express();

app.use(cors());

const server = createServer(app);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get('/scrims',async (req, res) => {

    let topPlayers =await getTopPlayers(db, 100);
    let con = convertStats(topPlayers)
    console.log(con)
    res.send(con);
});
app.get('/seasonal',async (req, res) => {
    let data = await getOrganizedGameModeStats(db)
    res.send(data);
})
app.get('/seasonalRanked',async (req, res) => {
    let data = await getOrganizedRankedStats(db)
    res.send(data);
})


server.listen(3100, () => {
    console.log('Server started on port 3100');
});


function convertStats(inputArray) {
    return inputArray
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((player, index) => ({
            id: index + 1,
            name: player.username,
            kills: player.totalKills,
            assists: player.totalAssists,
            damage: Math.round(player.totalDamage),
            points: Math.round(player.totalScore),
        }));
}

const players = [
    "Inaishingi", "RED_-TAUHiD-TH21", "AAL_Maruf", "Shadow4412", "BADSHAxVAI",
    "HOSSAIN-BAADSHAH", "Faraby_Pranto", "Extrudos", "Limon_Hossain", "MR_P0002",
    "Avoid_Ferdous", "SI-ANIK", "Topu9911", "Noob_Mal", "AjUbA_-", "Gangnamstyle007",
    "ML_Labib", "Mr_Mukta", "israr009", "Delta_Priotosh", "PineapplePIE_27",
    "Broom-stick", "Jecker24", "ShahMahdi", "FahimSarker", "amin996677", "SycoraxStyx",
    "nafiz11222", "Jaky_Adib", "sheaksadi", "arafat4050", "FoysalMahee", "Sobuj90",
    "AbdurRakib", "Sohail_12", "Bot_Shawn", "Kuro-TheLazyBoy", "firozmahmud009",
    "NiloyNILL", "AluzzGaming", "Deadly_Ruhit", "DXMushfiqur", "KALA_PASHA",
    "Nazmul_Ahashan_2", "FriCK0", "SajidulVai", "Gausul2016", "Delta_Redwan", "S-Y-C-O",
    "LaalBhai", "BGRxNADIM", "Muaz_26", "RUR4M", "AWMxPlayzone", "SHUVO_-", "eskaadee",
    "assassino_1394", "Fah_Fish", "MustakimAyon32", "RafsanIsBack", "RATHIX007", "SRC22LB",
    "PRISONER_-302", "Prisoner-302", "NOTHING_XD", "RahatSkywalker", "RIOXY_RIFAT",
    "Tawhid_Alam", "iFl4nk-_-", "ABDULLAH_03", "Ashuixd", "BD-Force-Kabir", "RiPAvocado",
    "TDxViSion", "ZYGOTE666", "Mister-XoX", "ranjuuuuu", "SADDUisALIVE", "SADDUisALIVE"
];



for (let player of players) {
    let playerExists = await checkPlayerExists(db, player)
    console.log(playerExists.exists && playerExists.player.playerId)



    // let playerId = playerExists?.player?.playerId
    let playerId = ""
    try {
        // if (!playerExists.exists){
        //     if (!playerId.startsWith("account.")){
        //             console.log("player", player)
        //             let playerInfo = await getPlayerData(player)
        //             playerId = playerInfo.data[0].id
        //
        //
        //
        //     }
        //
        //     await createPlayer(db, player, playerId)
        // }else{
        //     playerId = playerExists.player.playerId
        // }


        // let playerSeasonData = await getPlayerSeasonData(playerId, "division.bro.official.pc-2018-34")
        // let tr = transformPlayerSeasonData(playerSeasonData)
        // for (let r of tr){
        //     await upsertPlayerGameModeStats(db, r)
        // }

        // let rankedSeasonData = await getPlayerSeasonRankedData(playerId, "division.bro.official.pc-2018-34")
        // let tr = transformRankedPlayerStats(rankedSeasonData)
        // for (let r of tr){
        //     await upsertPlayerRankedStats(db, r)
        // }
    }catch (error) {
        console.log("error", error)
    }
}