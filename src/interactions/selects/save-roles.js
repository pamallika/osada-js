module.exports = {
    name: 'save-roles',
    async execute(interaction, client) {
        await interaction.deferUpdate();

        const roleIds = interaction.values;

        try {
            // 1. Сохраняем
            await client.api.setupGuild({
                discord_id: interaction.guild.id,
                name: interaction.guild.name,
                officer_role_ids: roleIds
            });

            // 2. Получаем настройки
            const response = await client.api.getGuildSettings(interaction.guild.id);

            // 3. Обновляем Dashboard
            const dashboard = client.embeds.renderSetupDashboard(interaction.guild, response.data.data);
            await interaction.editReply(dashboard);

        } catch (e) {
            console.error(e);
            await interaction.followUp({ content: "❌ Ошибка при обновлении ролей", ephemeral: true });
        }
    }
};