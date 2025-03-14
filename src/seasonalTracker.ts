import {getPlayerSeasonData, getPlayerSeasonRankedData} from "./api.js";
import {db} from "./config.js";
import {getPlayers} from "./db/player.js";
import {
    transformPlayerSeasonData,
    transformRankedPlayerStats,
    upsertPlayerGameModeStats,
    upsertPlayerRankedStats
} from "./db/seasonalStats.js";
import cron from "node-cron"


export class SeasonalTracker {
    constructor() {
        cron.schedule('0 5 * * *', () => {
            console.log('Running the scheduled task at 5:00 AM...');
            this.updateSeasonalData().then();
        }, {
            scheduled: true,
            timezone: "UTC" // Change to your preferred timezone
        });
    }

    async updateSeasonalData(){
        try {
            let players = await getPlayers()

            for (let player of players) {
                let playerSeasonalStats = await getPlayerSeasonData(player.playerId, "")
                let t =  transformPlayerSeasonData(playerSeasonalStats)
                for (let ts of t){
                    await upsertPlayerGameModeStats(db, ts)
                }
                let playerRankedStats = await getPlayerSeasonRankedData(player.playerId, "")
                let r = transformRankedPlayerStats(playerRankedStats)
                for (let rs of r){
                    await upsertPlayerRankedStats(db, rs)
                }


            }


        }catch (error) {

        }
    }
}