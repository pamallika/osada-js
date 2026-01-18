const { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const Bot = require('../../Bot');

module.exports = {
    name: 'event_create-squad',

    /**
     * @param {ButtonInteraction} interaction
     * @param {Bot} client
     */
    async execute(interaction, client) {
        console.log(`[Handler /create-squad-button.js] -> Button clicked by ${interaction.user.tag}`);

        // 1. Проверка прав
        const isAllowed = await client.checkPermissions(interaction);
        if (!isAllowed) {
            console.log(`[Handler /create-squad-button.js] -> User ${interaction.user.tag} has no permissions.`);
            return interaction.reply({
                content: "❌ У вас нет прав для управления этим событием.",
                ephemeral: true
            });
        }
        console.log(`[Handler /create-squad-button.js] -> User ${interaction.user.tag} has permissions.`);

        // 2. Показываем модальное окно
        const eventId = interaction.customId.split('_')[2];

        const modal = new ModalBuilder()
            .setCustomId(`squad_create_${eventId}`)
            .setTitle('Создание нового отряда');

        const nameInput = new TextInputBuilder()
            .setCustomId('squad_name')
            .setLabel('Название отряда')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Например: Основа')
            .setRequired(true);

        const limitInput = new TextInputBuilder()
            .setCustomId('squad_limit')
            .setLabel('Лимит участников')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Например: 25')
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
        const secondActionRow = new ActionRowBuilder().addComponents(limitInput);

        modal.addComponents(firstActionRow, secondActionRow);

        await interaction.showModal(modal);
        console.log(`[Handler /create-squad-button.js] -> Modal shown to user for event ID: ${eventId}`);
    }
};
