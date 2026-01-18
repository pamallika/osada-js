const { ButtonInteraction, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const Bot = require('../../Bot');

module.exports = {
    name: 'event_edit-squads',

    /**
     * @param {ButtonInteraction} interaction
     * @param {Bot} client
     */
    async execute(interaction, client) {
        console.log(`[Handler /edit-squads-button.js] -> Button clicked by ${interaction.user.tag}`);

        const isAllowed = await client.checkPermissions(interaction);
        if (!isAllowed) {
            console.log(`[Handler /edit-squads-button.js] -> User ${interaction.user.tag} has no permissions.`);
            return interaction.reply({
                content: "❌ У вас нет прав для управления этим событием.",
                ephemeral: true
            });
        }
        console.log(`[Handler /edit-squads-button.js] -> User ${interaction.user.tag} has permissions.`);

        await interaction.deferReply({ ephemeral: true });

        const eventId = interaction.customId.split('_')[2];

        try {
            // 1. Получаем информацию о событии, чтобы получить список отрядов
            console.log(`[Handler /edit-squads-button.js] -> Fetching event info for ID: ${eventId}`);
            const response = await client.api.getEventInfo(eventId);
            const event = response.data.data;

            if (!event.squads || event.squads.length === 0) {
                console.log('[Handler /edit-squads-button.js] -> No squads found for this event.');
                return interaction.followUp({ content: '❌ У этого события нет отрядов для редактирования.', ephemeral: true });
            }

            // 2. Создаем выпадающий список отрядов
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`squad_select-to-edit_${eventId}`)
                .setPlaceholder('Выберите отряд для редактирования')
                .addOptions(event.squads.map(squad => ({
                    label: squad.name,
                    description: `Лимит: ${squad.limit}`,
                    value: squad.id.toString(),
                })));

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.followUp({
                content: 'Выберите отряд, который хотите отредактировать:',
                components: [row],
                ephemeral: true,
            });
            console.log('[Handler /edit-squads-button.js] -> Select menu for squads sent to user.');

        } catch (error) {
            console.error('[Handler /edit-squads-button.js] -> ❌ API Error:', error.response?.data || error.message);
            await interaction.followUp({ content: `❌ Не удалось загрузить список отрядов для редактирования.`, ephemeral: true });
        }
    }
};
