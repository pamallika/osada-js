module.exports = {
    name: 'save-channels',
    async execute(interaction, client) {
        // Используем deferUpdate, так как мы редактируем текущее сообщение с селектором
        await interaction.deferUpdate();

        const [publicChannelId] = interaction.values;

        try {
            // 1. Сохраняем
            await client.api.setupGuild({
                discord_id: interaction.guild.id,
                name: interaction.guild.name,
                public_channel_id: publicChannelId
            });

            // 2. Получаем свежие настройки
            const response = await client.api.getGuildSettings(interaction.guild.id);

            // 3. Редактируем сообщение на новый Dashboard
            const dashboard = client.embeds.renderSetupDashboard(interaction.guild, response.data.data);
            await interaction.editReply(dashboard);

        } catch (e) {
            console.error(e);
            await interaction.followUp({ content: "❌ Ошибка при обновлении каналов", ephemeral: true });
        }
    }
};