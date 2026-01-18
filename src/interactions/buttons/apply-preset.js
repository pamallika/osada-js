const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: 'select-preset', // Должно совпадать с customId в CreateEventCommand (без префикса event_)
    async execute(interaction, client) {
        const selectedPresetId = interaction.values[0];

        // Обработка ручного ввода (если выбрали этот пункт)
        if (selectedPresetId === 'manual') {
            return interaction.reply({
                content: "📋 Режим ручного ввода структуры отрядов будет добавлен в следующем обновлении. Пока используйте пресеты.",
                ephemeral: true
            });
        }

        try {
            // 1. Сохраняем ID выбранного пресета во временный кэш бота
            // Это нужно, чтобы модальное окно знало, какой пресет использовать при сохранении
            client.tempSelections.set(interaction.user.id, {
                presetId: selectedPresetId
            });

            // 2. Создаем модальное окно для финальных деталей ивента (BDO Siege)
            const modal = new ModalBuilder()
                .setCustomId('event_final-create-modal')
                .setTitle('Детали ивента (Осада/Узел)');

            // Поле для названия (например: [VVV] Территория Кальфеон)
            const titleInput = new TextInputBuilder()
                .setCustomId('event_title')
                .setLabel("Название события")
                .setPlaceholder("Например: Осада Кальфеона / Узел 1ур")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(100);

            // Поле для времени (текстом, который потом распарсим)
            const timeInput = new TextInputBuilder()
                .setCustomId('event_time')
                .setLabel("Дата и время (МСК)")
                .setPlaceholder("Например: 25.10 20:00 или Сегодня в 21:00")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            // Добавляем компоненты в модалку
            modal.addComponents(
                new ActionRowBuilder().addComponents(titleInput),
                new ActionRowBuilder().addComponents(timeInput)
            );

            // 3. Показываем модалку офицеру
            await interaction.showModal(modal);

        } catch (e) {
            console.error("[Error in select-preset]:", e);
            if (!interaction.replied) {
                await interaction.reply({ content: "❌ Произошла ошибка при подготовке формы создания.", ephemeral: true });
            }
        }
    }
};