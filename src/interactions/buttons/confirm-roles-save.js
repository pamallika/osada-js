module.exports = {
    name: 'confirm-roles-save',
    async execute(interaction, client) {
        const selection = client.tempSelections.get(interaction.user.id);

        if (!selection || !selection.selectedRoles) {
            return interaction.reply({ content: "❌ Сначала выберите роли в списке!", ephemeral: true });
        }

        await interaction.deferUpdate();

        try {
            // Сохраняем в API
            await client.api.setupGuild({
                discord_id: interaction.guild.id,
                name: interaction.guild.name,
                officer_role_ids: selection.selectedRoles
            });

            // Очищаем временный кэш
            client.tempSelections.delete(interaction.user.id);

            // Возвращаем обновленный Dashboard
            const response = await client.api.getGuildSettings(interaction.guild.id);
            const dashboard = client.embeds.renderSetupDashboard(interaction.guild, response.data.data);

            await interaction.editReply(dashboard);

        } catch (e) {
            console.error(e);
            await interaction.followUp({ content: "❌ Ошибка сохранения ролей", ephemeral: true });
        }
    }
};