module.exports = {
    name: 'setup-channels-modal',
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const publicChannelId = interaction.fields.getTextInputValue('public_channel_id');
        const adminChannelId = interaction.fields.getTextInputValue('admin_channel_id');

        try {
            await client.api.setupGuild({
                discord_id: interaction.guild.id,
                name: interaction.guild.name,
                public_channel_id: publicChannelId,
                admin_channel_id: adminChannelId
            });

            await interaction.editReply({
                content: `✅ **Настройки каналов обновлены!**\n📢 Публичный: <#${publicChannelId}>\n🛠 Админ-панель: <#${adminChannelId}>`
            });
        } catch (e) {
            console.error(e);
            await interaction.editReply(`❌ Ошибка сохранения: ${e.response?.data?.message || e.message}`);
        }
    }
};