const { ActionRowBuilder, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'setup-roles',
    async execute(interaction) {
        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId('event_collect-roles') // Теперь он только собирает данные
            .setPlaceholder('Выберите офицерские роли...')
            .setMinValues(1)
            .setMaxValues(10);

        const confirmButton = new ButtonBuilder()
            .setCustomId('event_confirm-roles-save') // Эта кнопка сделает запрос в API
            .setLabel('Сохранить выбранные роли')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('✅');

        const row1 = new ActionRowBuilder().addComponents(roleSelect);
        const row2 = new ActionRowBuilder().addComponents(confirmButton);

        await interaction.reply({
            content: '🛡️ **Настройка прав доступа**\n1. Выберите роли в списке ниже.\n2. Нажмите кнопку **"Сохранить"**, когда закончите выбор.',
            components: [row1, row2],
            ephemeral: true
        });
    }
};