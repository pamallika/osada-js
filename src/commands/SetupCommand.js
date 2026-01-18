const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const Command = require('../structures/Command');

class SetupCommand extends Command {
    constructor() {
        super({
            name: 'setup',
            description: 'Панель управления настройками бота',
        });
    }
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const response = await client.api.getGuildSettings(interaction.guild.id);
            const dashboard = client.embeds.renderSetupDashboard(interaction.guild, response.data.data);

            await interaction.editReply(dashboard);
        } catch (e) {
            await interaction.editReply("❌ Ошибка загрузки панели управления.");
        }
    }
}

module.exports = SetupCommand;