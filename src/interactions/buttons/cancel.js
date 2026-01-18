module.exports = {
    name: 'cancel',
    async execute(interaction, client) {
        const isAllowed = await client.checkPermissions(interaction);
        if (!isAllowed) {
            return interaction.reply({
                content: "❌ У вас нет прав для управления этим ивентом.",
                ephemeral: true
            });
        }

        await interaction.deferUpdate();
        const eventId = interaction.customId.split('_')[2];

        // 1. Получаем инфо, чтобы знать, какое сообщение удалять в паблике
        const { data: { data: eventBefore } } = await client.api.getEventInfo(eventId);

        if (eventBefore.discord_message_id && eventBefore.public_channel_id) {
            try {
                const publicChannel = await interaction.guild.channels.fetch(eventBefore.public_channel_id);
                const msg = await publicChannel.messages.fetch(eventBefore.discord_message_id);
                if (msg) await msg.delete();
            } catch (e) {
                console.log("[System] Сообщение для удаления не найдено или уже удалено.");
            }
        }

        // 2. Уведомляем бэкенд об отмене
        await client.api.cancelEvent(eventId);

        // 3. Обновляем админку (статус сменится на Cancelled)
        const { data: { data: eventAfter } } = await client.api.getEventInfo(eventId);
        await interaction.editReply(client.embeds.renderAdminPanel(eventAfter));
    }
};