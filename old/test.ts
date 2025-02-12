// Environment and imports
import axios from "axios";
import dotenv from 'dotenv';
import {
    Client,
    Events,
    GatewayIntentBits,
    GuildTextBasedChannel,
    REST,
    Routes,
    SlashCommandBuilder
} from "discord.js";

// Types
import {
    MatchData,
    Team,
    Participant,
    TeamMember
} from '../src/types';  // Move types to separate file

// Configuration
dotenv.config({ path: "../.env" });

const CONFIG = {
    WEBHOOK_URL: process.env.WEBHOOK_URL,
    BOT_TOKEN: process.env.DISCORD_TOKEN,
    PUBG_API_KEY: process.env.PUBG_API_KEY,
    CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_AVATAR: process.env.DISCORD_AVATAR,
    CHECK_INTERVAL: 30000, // 30 seconds
    INACTIVITY_TIMEOUT: 2 * 60 * 60 * 1000, // 2 hours
    MVP_WEIGHTS: {
        KILLS: 3,
        ASSISTS: 1,
        DAMAGE: 0.01,
        SURVIVAL: 0.5,
        RANK: 10
    }
};

// API Service
class PUBGApiService {
    private readonly api;

    constructor() {
        this.api = axios.create({
            baseURL: 'https://api.pubg.com/shards/steam',
            headers: {
                'Authorization': `Bearer ${CONFIG.PUBG_API_KEY.trim()}`,
                'Accept': 'application/vnd.api+json'
            }
        });
    }

    async getMatchData(matchId: string): Promise<MatchData> {
        const response = await this.api.get(`/matches/${matchId}`);
        return response.data;
    }

    async getPlayerMatches(playerName: string, count: number = 1): Promise<string[]> {
        const response = await this.api.get('/players', {
            params: { 'filter[playerNames]': playerName }
        });
        return response.data.data[0].relationships.matches.data
            .slice(0, count)
            .map(match => match.id);
    }

    async findLastCustomGame(matches: string[]): Promise<string | null> {
        for (const matchId of matches) {
            try {
                const data = await this.getMatchData(matchId);
                if (data.data.attributes.matchType === 'custom') {
                    return matchId;
                }
            } catch (error) {
                console.error(`Failed to get match ID ${matchId}:`, error);
            }
        }
        return null;
    }
}

// Match Analysis Service
class MatchAnalyzer {
    static getTeams(data: MatchData): Team[] {
        const rosters = data.included.filter(item => item.type === 'roster');
        const participants = data.included.filter(item => item.type === 'participant');

        return rosters.map(roster => ({
            ...roster,
            players: roster.relationships.participants.data
                .map(p => {
                    const participantData = participants.find(item => item.id === p.id);
                    if (!participantData) return null;

                    const mvpScore = this.calculateMVPScore(
                        participantData,
                        roster.attributes.stats.rank,
                        data.data.attributes.duration,
                        rosters.length
                    );

                    return { ...participantData, MVPScore: mvpScore };
                })
                .filter(p => p !== null) as TeamMember[]
        }));
    }

    static calculateMVP(data: MatchData): Participant {
        const participants = data.included.filter(item => item.type === 'participant');
        return participants.reduce((mvp, participant) => {
            const score = this.calculateMVPScore(
                participant,
                participant.attributes.stats.winPlace,
                data.data.attributes.duration,
                data.included.filter(item => item.type === 'roster').length
            );
            //@ts-ignore
            return (!mvp || score > mvp.MVPScore) ? { ...participant, MVPScore: score } : mvp;
        }, null);
    }

    private static calculateMVPScore(
        player: Participant,
        teamRank: number,
        matchDuration: number,
        totalTeams: number
    ): number {
        const { kills, assists, damageDealt, timeSurvived } = player.attributes.stats;
        const { KILLS, ASSISTS, DAMAGE, SURVIVAL, RANK } = CONFIG.MVP_WEIGHTS;

        const timeSurvivedNormalized = timeSurvived / matchDuration;
        const rankBonus = Math.max(0, (totalTeams - teamRank + 1) / totalTeams);

        return (
            KILLS * kills +
            ASSISTS * assists +
            DAMAGE * damageDealt +
            SURVIVAL * timeSurvivedNormalized +
            RANK * rankBonus
        );
    }
}

// Discord Service
class DiscordService {
    private client: Client;
    private rest: REST;
    private pubgApi: PUBGApiService;
    private subscriptionChannel: GuildTextBasedChannel | null = null;
    private lastCustomGameId: string | null = null;
    private lastMatchTime: Date | null = null;
    private checkInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });
        this.rest = new REST({ version: '10' }).setToken(CONFIG.BOT_TOKEN);
        this.pubgApi = new PUBGApiService();
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.client.once(Events.ClientReady, this.handleReady.bind(this));
        this.client.on('interactionCreate', this.handleInteraction.bind(this));
    }

    private async handleReady(readyClient): Promise<void> {
        console.log(`Ready! Logged in as ${readyClient.user.tag}`);
        await this.registerCommands();
    }

    private async handleInteraction(interaction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        try {
            switch (interaction.commandName) {
                case 'subscribe':
                    await this.handleSubscribe(interaction);
                    break;
                case 'unsubscribe':
                    await this.handleUnsubscribe(interaction);
                    break;
                case 'get':
                    await this.handleGet(interaction);
                    break;
                case 'get_id':
                    await this.handleGetId(interaction);
                    break;
            }
        } catch (error) {
            console.error('Interaction error:', error);
            await interaction.reply({
                content: '❌ There was an error processing your request.',
                ephemeral: true
            });
        }
    }

    private async registerCommands(): Promise<void> {
        const commands = [
            new SlashCommandBuilder()
                .setName('subscribe')
                .setDescription('Subscribe to updates with your name')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Your name for the subscription')
                        .setRequired(true)
                ),
            new SlashCommandBuilder()
                .setName('unsubscribe')
                .setDescription('Unsubscribe from updates'),
            new SlashCommandBuilder()
                .setName('get')
                .setDescription('Get last custom match with your name')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Your name to get')
                        .setRequired(true)
                ),
            new SlashCommandBuilder()
                .setName('get_id')
                .setDescription('Get last custom match with id')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('Your id to get')
                        .setRequired(true)
                )
        ];

        try {
            await this.rest.put(
                Routes.applicationCommands(CONFIG.CLIENT_ID),
                { body: commands.map(command => command.toJSON()) }
            );
            console.log('Successfully registered application commands.');
        } catch (error) {
            console.error('Error registering commands:', error);
        }
    }

    async start(): Promise<void> {
        await this.client.login(CONFIG.BOT_TOKEN);
    }

    private async handleSubscribe(interaction): Promise<void> {
        const name = interaction.options.getString('name');
        this.subscriptionChannel = interaction.channel;

        try {
            await this.startSubscription(name);
            await interaction.reply({
                content: `✅ Successfully subscribed ${name} for custom games!`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Subscription error:', error);
            await interaction.reply({
                content: '❌ Failed to subscribe.',
                ephemeral: true
            });
        }
    }

    private async startSubscription(name: string): Promise<void> {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        const subscribedTime = new Date();
        this.lastMatchTime = new Date();

        this.checkInterval = setInterval(async () => {
            if (Date.now() - this.lastMatchTime.getTime() > CONFIG.INACTIVITY_TIMEOUT) {
                this.handleInactivity();
                return;
            }

            try {
                const matches = await this.pubgApi.getPlayerMatches(name);
                const matchData = await this.pubgApi.getMatchData(matches[0]);

                if (this.shouldProcessMatch(matchData, subscribedTime)) {
                    await this.processMatch(matchData);
                }
            } catch (error) {
                console.error('Error checking matches:', error);
            }
        }, CONFIG.CHECK_INTERVAL);
    }

    private shouldProcessMatch(matchData: MatchData, subscribedTime: Date): boolean {
        if (matchData.data.attributes.matchType !== 'custom') {
            return false;
        }

        const matchTime = new Date(matchData.data.attributes.createdAt);
        matchTime.setSeconds(matchTime.getSeconds() + matchData.data.attributes.duration);

        return matchTime.getTime() >= subscribedTime.getTime() &&
            this.lastCustomGameId !== matchData.data.id;
    }

    private async processMatch(matchData: MatchData): Promise<void> {
        this.lastCustomGameId = matchData.data.id;
        this.lastMatchTime = new Date();
        await this.sendMatchToDiscord(matchData.data.id);
    }

    private handleInactivity(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }

        if (this.subscriptionChannel) {
            this.subscriptionChannel.send("Auto unsubscribed due to inactivity");
        }
    }

    private async handleUnsubscribe(interaction): Promise<void> {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            this.lastCustomGameId = null;
        }

        await interaction.reply({
            content: '✅ Successfully unsubscribed from updates!',
            ephemeral: true
        });
    }

    private async handleGet(interaction): Promise<void> {
        const playerName = interaction.options.getString('name');

        try {
            await interaction.reply({
                content: `Trying to get last custom game in last 15 matches for ${playerName}`,
                ephemeral: true
            });

            const matches = await this.pubgApi.getPlayerMatches(playerName, 15);
            const matchId = await this.pubgApi.findLastCustomGame(matches);

            if (!matchId) {
                await interaction.followUp({
                    content: `❌ No custom game found in last 15 matches for ${playerName}`,
                    ephemeral: true
                });
                return;
            }

            await this.sendMatchToDiscord(matchId);
        } catch (error) {
            console.error('Error getting match:', error);
            await interaction.followUp({
                content: '❌ Failed to process the request.',
                ephemeral: true
            });
        }
    }

    private async handleGetId(interaction): Promise<void> {
        const matchId = interaction.options.getString('id');

        try {
            await interaction.reply({
                content: 'Trying to get custom game from id',
                ephemeral: true
            });
            await this.sendMatchToDiscord(matchId);
        } catch (error) {
            console.error('Error getting match by ID:', error);
            await interaction.followUp({
                content: '❌ Failed to process the request.',
                ephemeral: true
            });
        }
    }

    private async sendMatchToDiscord(matchId: string): Promise<void> {
        const matchData = await this.pubgApi.getMatchData(matchId);
        const teams = MatchAnalyzer.getTeams(matchData);
        const mvp = MatchAnalyzer.calculateMVP(matchData);
        await this.sendTeamsToDiscord(teams, mvp);
    }

    private async sendTeamsToDiscord(teams: Team[], mvp: Participant): Promise<void> {
        const sortedTeams = teams.sort((a, b) =>
            a.attributes.stats.rank - b.attributes.stats.rank
        );

        const embeds = this.createTeamEmbeds(sortedTeams, mvp);

        // Send embeds in chunks of 10 (Discord limit)
        for (let i = 0; i < embeds.length; i += 10) {
            const embedChunk = embeds.slice(i, i + 10);

            try {
                await axios.post(CONFIG.WEBHOOK_URL, {
                    username: "PUBG Match Stats",
                    embeds: embedChunk,
                    avatar_url: CONFIG.DISCORD_AVATAR
                });
                console.log(`Sent teams ${i + 1}-${i + embedChunk.length} to Discord`);
            } catch (error) {
                console.error('Error sending webhook:', error);
            }
        }
    }

    private createTeamEmbeds(teams: Team[], mvp: Participant): any[] {
        return teams.map((team, index) => {
            const totalKills = team.players.reduce((sum, player) =>
                sum + player.attributes.stats.kills, 0);

            const playerFields = team.players.map(player => ({
                name: `${player.attributes.stats.name}${mvp.id === player.id ? ' 👑MVP' : ''}`,
                value: `Kills: ${player.attributes.stats.kills}\n` +
                    `Damage: ${Math.round(player.attributes.stats.damageDealt)}\n` +
                    `Assists: ${player.attributes.stats.assists}`,
                inline: true
            }));

            return {
                title: `Team #${team.attributes.stats.teamId} - Rank: ${team.attributes.stats.rank}`,
                description: `${team.attributes.won === "true" ? "🏆 Winner!\n" : ""}` +
                    `**Total Kills:** ${totalKills}`,
                fields: playerFields.length > 0 ? playerFields : [{
                    name: "No Players",
                    value: "This team has no players.",
                    inline: true
                }],
                color: this.getTeamColor(index)
            };
        });
    }


    private getTeamColor(index: number): number {
        switch (index) {
            case 0: return 0xFF0000;  // Red - 1st place
            case 1: return 0xFFA500;  // Orange - 2nd place
            case 2: return 0xFFFF00;  // Yellow - 3rd place
            default: return 0x00FFFF; // Cyan - other places
        }
    }
}


// Main application entry point (index.ts.old)
async function main() {
    try {
        const discordService = new DiscordService();
        await discordService.start();
        console.log('PUBG Discord Bot started successfully');
    } catch (error) {
        console.error('Failed to start bot:', error);
        process.exit(1);
    }
}

// Start the application
main().catch(console.error);

