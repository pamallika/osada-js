module.exports = {
    name: 'collect-roles',
    async execute(interaction, client) {
        // Мы просто подтверждаем выбор во временном хранилище
        client.tempSelections.set(interaction.user.id, {
            ...client.tempSelections.get(interaction.user.id),
            selectedRoles: interaction.values
        });

        // Отвечаем "тихо", чтобы Discord не выдавал ошибку взаимодействия
        await interaction.deferUpdate();
    }
};