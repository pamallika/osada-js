const { ModalSubmitInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Bot = require('../../Bot');

module.exports = {
    name: 'event_create-base',

    /**
     * @param {ModalSubmitInteraction} interaction
     * @param {Bot} client
     */
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        console.log('[Handler /create-base-event-modal.js] -> Interaction deferred.');

        const name = interaction.fields.getTextInputValue('event_name');
        const description = interaction.fields.getTextInputValue('event_description');
        const dateTime = interaction.fields.getTextInputValue('event_datetime');

        console.log(`[Handler /create-base-event-modal.js] -> Data: Name='${name}', Desc='${description}', DateTime='${dateTime}'`);

        try {
            console.log('[Handler /create-base-event-modal.js] -> Sending API request to create event...');
            
            // Возвращаемся к минимальному набору данных
            const eventData = {
                name,
                description,
                start_at: dateTime,
                discord_guild_id: interaction.guild.id,
                region: 'eu', // Это поле оставим, так как оно все еще required
            };

            const response = await client.api.createEvent(eventData);

            const event = response.data.data;
            console.log(`[Handler /create-base-event-modal.js] -> API Success! Event created with ID: ${event.id}`);

            const embed = new EmbedBuilder()
                .setTitle(event.name)
                .setDescription(event.description || 'Описание не указано.')
                .setColor('#f5d442')
                .addFields(
                    { name: 'Время', value: `<t:${Math.floor(new Date(event.start_at).getTime() / 1000)}:F>`, inline: true },
                    { name: 'Статус', value: '🟡 **Черновик (Настройка отрядов)**', inline: true },
                    { name: 'Отряды', value: '> *Отряды еще не настроены.*' }
                )
                .setFooter({ text: `Event ID: ${event.id}` });

            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`event_apply-preset_${event.id}`)
                        .setLabel('Применить пресет')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('📝'),
                    new ButtonBuilder()
                        .setCustomId(`event_create-squad_${event.id}`)
                        .setLabel('Создать отряд')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('🛠️'),
                    new ButtonBuilder()
                        .setCustomId(`event_publish_${event.id}`)
                        .setLabel('Опубликовать')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('✅'),
                    new ButtonBuilder()
                        .setCustomId(`event_delete_${event.id}`)
                        .setLabel('Удалить')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🗑️')
                );

            await interaction.followUp({
                content: '✅ Событие создано как черновик. Теперь вы можете настроить отряды.',
                embeds: [embed],
                components: [buttons],
                ephemeral: true
            });
            console.log('[Handler /create-base-event-modal.js] -> Control panel sent to user.');

        } catch (error) {
            console.error('[Handler /create-base-event-modal.js] -> ❌ API Error:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || 'Произошла ошибка при создании события на бэкенде.';
            await interaction.followUp({ content: `❌ ${errorMessage}`, ephemeral: true });
        }
    }
};
