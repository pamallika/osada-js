module.exports = {
    name: 'decline',
    async execute(interaction, client) {
        await interaction.deferUpdate();

        const eventId = interaction.customId.split('_')[2];

        await client.api.recordAction({
            event_id: eventId,
            discord_user_id: interaction.user.id,
            action: 'decline'
        });

        const { data: { data: updatedEvent } } = await client.api.getEventInfo(eventId);
        await interaction.editReply(client.embeds.renderPublicEvent(updatedEvent));
    }
};