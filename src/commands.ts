import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { BOT_TOKEN } from './config.js';

export const commands = {
    subscribe: new SlashCommandBuilder()
        .setName('subscribe')
        .setDescription('Subscribe to updates with your name')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Your name for the subscription')
                .setRequired(true)
        ),

    unsubscribe: new SlashCommandBuilder()
        .setName('unsubscribe')
        .setDescription('Unsubscribe from updates'),

    getLastByName: new SlashCommandBuilder()
        .setName('get')
        .setDescription('get last custom match with your name')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Your name to get')
                .setRequired(true)
        ),

    getLastByMatchId: new SlashCommandBuilder()
        .setName('get_id')
        .setDescription('get last custom match with id')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Your id to get')
                .setRequired(true)
        ),

    reset: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Reset Leaderboard'),

    leaderboard: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show Leaderboard')

};

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

export async function registerCommands() {
    try {
        console.log('Started refreshing application (/) commands.');

        const commandsToRegister = [
            commands.subscribe.toJSON(),
            commands.unsubscribe.toJSON(),
            commands.getLastByName.toJSON(),
            commands.getLastByMatchId.toJSON(),
            commands.reset.toJSON(),
            commands.leaderboard.toJSON()
        ];

        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commandsToRegister }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
        throw error;
    }
}
