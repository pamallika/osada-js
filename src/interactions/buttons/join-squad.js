module.exports = {
    name: 'join-squad',
    async execute(interaction, client) {
        await interaction.deferUpdate();

        // Достаем ID ивента из футера эмбеда (стандарт нашего EmbedService)
        const footerText = interaction.message.embeds[0].footer?.text;
        const eventId = footerText?.match(/ID:\s*(\d+)/)?.[1];

        if (!eventId) throw new Error("ID ивента не найден в сообщении");

        // customId кнопки: event_join-squad_ID_ОТРЯДА
        const squadId = interaction.customId.split('_')[2];

        // Вызываем наш новый RESTful метод
        await client.api.recordAction({
            event_id: eventId,
            discord_user_id: interaction.user.id,
            action: 'join_squad',
            squad_id: squadId
        });

        // Обновляем Embed свежими данными
        const { data: { data: updatedEvent } } = await client.api.getEventInfo(eventId);
        const publicView = client.embeds.renderPublicEvent(updatedEvent);

        await interaction.editReply(publicView);
    }
};