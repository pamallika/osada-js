module.exports = {
    name: 'confirm-preset',
    async execute(interaction, client) {
        const isAllowed = await client.checkPermissions(interaction);
        if (!isAllowed) {
            return interaction.reply({
                content: "❌ У вас нет прав для управления этим ивентом.",
                ephemeral: true
            });
        }
        await interaction.deferUpdate();
        const selection = client.tempSelections.get(interaction.user.id);

        if (!selection || !selection.squadId || !selection.presetId) {
            return interaction.followUp({ content: "⚠️ Сначала выберите отряд и пресет в списках выше!", ephemeral: true });
        }

        // Вызываем API Laravel
        await client.api.applyPreset(selection.squadId, selection.presetId);

        // Очищаем кэш выбора
        client.tempSelections.delete(interaction.user.id);

        // Обновляем админку
        const { data: { data: event } } = await client.api.getEventInfo(selection.eventId);
        await interaction.editReply({
            content: "✅ Пресет успешно применен!",
            components: [],
            embeds: [] // Очищаем временное сообщение селектора
        });

        // Важно: Нам также нужно обновить основное сообщение админки, если оно было в другом месте.
        // Но обычно этот вызов идет внутри эфемерного ответа.
    }
};