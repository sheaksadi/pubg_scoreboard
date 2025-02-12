import { Participant, MatchData } from './types.js';

export function calculateMVPScore(
    player: Participant,
    teamRank: number,
    matchDuration: number,
    totalTeams: number
): number {
    const { kills, assists, damageDealt, timeSurvived } = player.attributes.stats;

    const W_k = 3;   // Weight for kills
    const W_a = 1;   // Weight for assists
    const W_d = 0.01; // Weight for damage
    const W_s = 0.5; // Weight for survival
    const W_r = 10;  // Weight for rank bonus

    const timeSurvivedNormalized = timeSurvived / matchDuration;
    const rankBonus = Math.max(0, (totalTeams - teamRank + 1) / totalTeams);

    return (
        W_k * kills +
        W_a * assists +
        W_d * damageDealt +
        W_s * timeSurvivedNormalized +
        W_r * rankBonus
    );
}

export function calculateMVP(data: MatchData): Participant {
    let participants = data.included.filter(item => item.type === 'participant')
    let rosters = data.included.filter(item => item.type === 'roster')
    let MVP: Participant | null = null
    let MVPScore = 0
    for (let participant of participants) {
        let mvpScore = calculateMVPScore(participant, participant.attributes.stats.winPlace, data.data.attributes.duration, rosters.length)
        if (MVP === null || mvpScore > MVPScore) {
            MVP = participant
            MVPScore = mvpScore
        }

    }
    return MVP
}