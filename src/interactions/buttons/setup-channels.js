const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');

module.exports = {
    name: 'setup-channels',
    async execute(interaction) {
        const channelSelect = new ChannelSelectMenuBuilder()
            .setCustomId('event_save-channels')
            .setPlaceholder('Выберите канал для публикации анонсов')
            .setMinValues(1)
            .setMaxValues(1)
            .addChannelTypes(ChannelType.GuildText);

        const row = new ActionRowBuilder().addComponents(channelSelect);

        await interaction.reply({
            content: '📌 **Настройка анонсов:**\nВыберите канал, в который бот будет дублировать сообщения об осадах после их публикации.',
            components: [row],
            ephemeral: true
        });
    }
};