module.exports = {
    name: 'select', // Мы настроим роутер в Bot.js, чтобы он ловил частичные совпадения или добавим префикс
    async execute(interaction, client) {
        const [prefix, action, eventId] = interaction.customId.split('_');

        // Получаем или создаем объект выбора для этого пользователя
        let selection = client.tempSelections.get(interaction.user.id) || { eventId };

        if (action === 'select-squad-for-preset') selection.squadId = interaction.values[0];
        if (action === 'select-preset-id') selection.presetId = interaction.values[0];

        client.tempSelections.set(interaction.user.id, selection);

        await interaction.reply({ content: "✅ Выбор зафиксирован", flags: [64] }); // 64 = Ephemeral
    }
};