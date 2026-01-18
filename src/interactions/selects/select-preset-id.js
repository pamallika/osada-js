module.exports = {
    name: 'select-preset-id',
    async execute(interaction, client) {
        let selection = client.tempSelections.get(interaction.user.id) || {};
        selection.presetId = interaction.values[0];

        client.tempSelections.set(interaction.user.id, selection);
        await interaction.reply({ content: "✅ Пресет выбран", ephemeral: true });
    }
};