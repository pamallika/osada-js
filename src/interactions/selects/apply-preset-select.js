const { StringSelectMenuInteraction, EmbedBuilder } = require('discord.js');
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
            console.log('[Handler /apply-preset-select.js] -> API Success! Preset applied.');

            console.log(`[Handler /apply-preset-select.js] -> Fetching updated event info for ID: ${eventId}`);
            const response = await client.api.getEventInfo(eventId);
            const updatedEvent = response.data.data;

            // Находим исходное сообщение и правильно обновляем его
            const originalMessage = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
            const originalEmbed = originalMessage.embeds[0];

            const squadsString = updatedEvent.squads.map(s => `> **${s.name}**: 0/${s.limit}`).join('\n');
            const otherFields = originalEmbed.fields.filter(f => f.name !== 'Отряды');

            const newEmbed = new EmbedBuilder()
                .setTitle(originalEmbed.title)
                .setDescription(originalEmbed.description)
                .setColor(originalEmbed.color)
                .setFooter(originalEmbed.footer)
                .setFields(otherFields)
                .addFields({ name: 'Отряды', value: squadsString });

            await originalMessage.edit({
                embeds: [newEmbed]
            });
            console.log('[Handler /apply-preset-select.js] -> Control panel updated.');

            await interaction.editReply({ content: '✅ Пресет успешно применен!', ephemeral: true });

        } catch (error) {
            console.error('[Handler /apply-preset-select.js] -> ❌ API Error:', error.response?.data || error.message);
            await interaction.editReply({ content: `❌ Ошибка: ${error.response?.data?.message || 'Не удалось применить пресет.'}`, ephemeral: true });
        }
    }
};
