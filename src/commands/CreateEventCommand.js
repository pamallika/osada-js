const Command = require('../structures/Command');
const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require('discord.js');

class CreateEventCommand extends Command {
    constructor() {
        super({
            name: 'create-event',
            description: 'Создать новый ивент (осаду)',
        });
    }

    async execute(interaction, client) {
        // Создаем модальное окно для ввода базовой информации
        const modal = new ModalBuilder()
            .setCustomId('event_create-base') // Уникальный ID для обработчика модалок
            .setTitle('Создание нового события');

        // Поле для названия
        const nameInput = new TextInputBuilder()
            .setCustomId('event_name')
            .setLabel("Название события")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Например: Осада замка Кальфеон")
            .setRequired(true);

        // Поле для описания
        const descriptionInput = new TextInputBuilder()
            .setCustomId('event_description')
            .setLabel("Описание")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Например: Сбор в 20:00. При себе иметь баффы и эликсиры.")
            .setRequired(false);

        // Поле для даты и времени
        const dateTimeInput = new TextInputBuilder()
            .setCustomId('event_datetime')
            .setLabel("Дата и время начала")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Формат: ДД.ММ.ГГГГ ЧЧ:ММ (например, 25.12.2023 20:00)")
            .setRequired(true);

        // Добавляем поля в модальное окно
        const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
        const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(dateTimeInput);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        // Показываем модальное окно пользователю
        await interaction.showModal(modal);
    }
}

module.exports = CreateEventCommand;
