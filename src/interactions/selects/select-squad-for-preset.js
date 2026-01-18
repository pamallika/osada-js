module.exports = {
    name: 'select-squad-for-preset',
    async execute(interaction, client) {
        let selection = client.tempSelections.get(interaction.user.id) || {};
        selection.squadId = interaction.values[0];

        // Сохраняем eventId из customId (он там третий: event_action_ID)
        selection.eventId = interaction.customId.split('_')[2];

        client.tempSelections.set(interaction.user.id, selection);
        await interaction.reply({ content: "✅ Отряд выбран", ephemeral: true });
    }
};