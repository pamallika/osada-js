const { StringSelectMenuInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Bot = require('../../Bot');

module.exports = {
    name: 'squad_select-to-edit',

    /**
     * @param {StringSelectMenuInteraction} interaction
     * @param {Bot} client
     */
    async execute(interaction, client) {
        console.log(`[Handler /select-squad-to-edit.js] -> Squad selected by ${interaction.user.tag}`);

        const isAllowed = await client.checkPermissions(interaction);
        if (!isAllowed) {
            console.log(`[Handler /select-squad-to-edit.js] -> User ${interaction.user.tag} has no permissions.`);
            return interaction.reply({
                content: "❌ У вас нет прав для управления этим событием.",
                ephemeral: true
            });
        }
        console.log(`[Handler /select-squad-to-edit.js] -> User ${interaction.user.tag} has permissions.`);

        await interaction.deferUpdate(); // Отвечаем на выбор из списка

        const eventId = interaction.customId.split('_')[2];
        const squadId = interaction.values[0]; // ID выбранного отряда

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`squad_edit-limit_${eventId}_${squadId}`)
                    .setLabel('Изменить лимит')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('✏️'),
                new ButtonBuilder()
                    .setCustomId(`squad_delete_${eventId}_${squadId}`)
                    .setLabel('Удалить отряд')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🗑️')
            );

        await interaction.editReply({
            content: `Выбран отряд (ID: ${squadId}). Что вы хотите с ним сделать?`,
            components: [buttons],
            ephemeral: true,
        });
        console.log(`[Handler /select-squad-to-edit.js] -> Edit/Delete buttons sent for squad ID: ${squadId}`);
    }
};
