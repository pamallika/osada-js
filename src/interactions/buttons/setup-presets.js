const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: 'setup-presets',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('event_save-presets-modal')
            .setTitle('Создание пресета отрядов');

        const nameInput = new TextInputBuilder()
            .setCustomId('preset_name')
            .setLabel("Название пресета")
            .setPlaceholder("Например: Осада 50х50")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const structureInput = new TextInputBuilder()
            .setCustomId('preset_structure')
            .setLabel("Структура (Название:Размер)")
            .setPlaceholder("Группа 1:5, Группа 2:5, Резерв:0")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(structureInput)
        );

        await interaction.showModal(modal);
    }
};