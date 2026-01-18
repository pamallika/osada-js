const { StringSelectMenuInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Bot = require('../../Bot');

module.exports = {
    name: 'preset_apply',

    /**
     * @param {StringSelectMenuInteraction} interaction
     * @param {Bot} client
     */
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        console.log(`[Handler /apply-preset-select.js] -> Preset selected by ${interaction.user.tag}`);

        const eventId = interaction.customId.split('_')[2];
        const presetId = interaction.values[0];
        console.log(`[Handler /apply-preset-select.js] -> Data: EventID=${eventId}, PresetID='${presetId}'`);

        try {
            console.log('[Handler /apply-preset-select.js] -> Sending API request to apply preset...');
            await client.api.applyPresetToEvent(eventId, presetId);

            // Находим исходное сообщение и правильно обновляем его
            const originalMessage = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
            const originalEmbed = originalMessage.embeds[0];
            const response = await client.api.getEventInfo(eventId);
            const updatedEvent = response.data.data;

            const squadsString = updatedEvent.squads.map(s => `> **${s.name}**: 0/${s.limit}`).join('\n');
            const otherFields = originalEmbed.fields.filter(f => f.name !== 'Отряды');

            const newEmbed = new EmbedBuilder()
                .setTitle(originalEmbed.title)
                .setDescription(originalEmbed.description)
                .setColor(originalEmbed.color)
                .setFooter(originalEmbed.footer)
                .setFields(otherFields)
                .addFields({ name: 'Отряды', value: squadsString });

            const newActionRowComponents = [
                new ButtonBuilder()
                    .setCustomId(`event_apply-preset_${updatedEvent.id}`)
                    .setLabel('Применить пресет')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📝'),
                new ButtonBuilder()
                    .setCustomId(`event_create-squad_${updatedEvent.id}`)
                    .setLabel('Создать отряд')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🛠️'),
                new ButtonBuilder()
                    .setCustomId(`event_publish_${updatedEvent.id}`)
                    .setLabel('Опубликовать')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId(`event_delete_${updatedEvent.id}`)
                    .setLabel('Удалить')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🗑️')
            ];

            if (updatedEvent.squads.length > 0) {
                newActionRowComponents.push(
                    new ButtonBuilder()
                        .setCustomId(`event_edit-squads_${updatedEvent.id}`)
                        .setLabel('Редактировать отряды')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('⚙️')
                );
            }
            const newActionRow = new ActionRowBuilder().addComponents(newActionRowComponents);

            await originalMessage.edit({
                embeds: [newEmbed],
                components: [newActionRow]
            });
            console.log('[Handler /apply-preset-select.js] -> Control panel updated.');

            await interaction.editReply({ content: '✅ Пресет успешно применен!', ephemeral: true });

        } catch (error) {
            console.error('[Handler /apply-preset-select.js] -> ❌ API Error:', error.response?.data || error.message);
            await interaction.editReply({ content: `❌ Ошибка: ${error.response?.data?.message || 'Не удалось применить пресет.'}`, ephemeral: true });
        }
    }
};
