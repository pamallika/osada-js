const { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Bot = require('../../Bot');

module.exports = {
    name: 'squad_delete',

    /**
     * @param {ButtonInteraction} interaction
     * @param {Bot} client
     */
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const [_, __, eventId, squadId] = interaction.customId.split('_');

        try {
            await client.api.deleteSquad(eventId, squadId);

            const response = await client.api.getEventInfo(eventId);
            const updatedEvent = response.data.data;

            const originalMessage = interaction.message.channel.messages.cache.get(interaction.message.reference.messageId) 
                                 || await interaction.message.channel.messages.fetch(interaction.message.reference.messageId);
            const originalEmbed = originalMessage.embeds[0];

            const squadsString = updatedEvent.squads && updatedEvent.squads.length > 0
                ? updatedEvent.squads.map(s => `> **${s.name}**: 0/${s.limit}`).join('\n')
                : '> *Отряды еще не настроены.*';
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

            await interaction.editReply({ content: '✅ Отряд успешно удален!', components: [] });

        } catch (error) {
            console.error('❌ API Error:', error.response?.data || error.message);
            await interaction.editReply({ content: `❌ Ошибка: ${error.response?.data?.message || 'Не удалось удалить отряд.'}`, ephemeral: true });
        }
    }
};
