const { ModalSubmitInteraction, EmbedBuilder } = require('discord.js');
const Bot = require('../../Bot');

module.exports = {
    name: 'squad_create',

    /**
     * @param {ModalSubmitInteraction} interaction
     * @param {Bot} client
     */
    async execute(interaction, client) {
        // Откладываем ответ, чтобы успеть обработать
        await interaction.deferReply({ ephemeral: true });
        console.log(`[Handler /create-squad-modal.js] -> Modal submitted by ${interaction.user.tag}`);

        const eventId = interaction.customId.split('_')[2];
        const squadName = interaction.fields.getTextInputValue('squad_name');
        const squadLimit = interaction.fields.getTextInputValue('squad_limit');

        console.log(`[Handler /create-squad-modal.js] -> Data: EventID=${eventId}, Name='${squadName}', Limit='${squadLimit}'`);

        try {
            // 1. Отправляем запрос на создание отряда в API
            console.log('[Handler /create-squad-modal.js] -> Sending API request to create squad...');
            await client.api.createSquad({
                event_id: eventId,
                name: squadName,
                limit: parseInt(squadLimit, 10)
            });
            console.log('[Handler /create-squad-modal.js] -> API Success! Squad created.');

            // 2. Получаем обновленную информацию о событии
            console.log(`[Handler /create-squad-modal.js] -> Fetching updated event info for ID: ${eventId}`);
            const response = await client.api.getEventInfo(eventId);
            const updatedEvent = response.data.data;

            // 3. Обновляем исходное сообщение
            const originalEmbed = interaction.message.embeds[0];
            
            const squadsString = updatedEvent.squads.map(s => `> **${s.name}**: 0/${s.limit}`).join('\n');
            const otherFields = originalEmbed.fields.filter(f => f.name !== 'Отряды');
            const newFields = [...otherFields, { name: 'Отряды', value: squadsString }];

            const newEmbed = EmbedBuilder.from(originalEmbed).setFields(newFields);

            // Используем interaction.message.edit для обновления исходного сообщения
            await interaction.message.edit({
                embeds: [newEmbed]
            });
            console.log('[Handler /create-squad-modal.js] -> Control panel updated.');

            // Добавляем сообщение об успехе
            await interaction.editReply({ content: '✅ Отряд успешно создан!', ephemeral: true });

        } catch (error) {
            console.error('[Handler /create-squad-modal.js] -> ❌ API Error:', error.response?.data || error.message);
            await interaction.editReply({ content: `❌ Ошибка: ${error.response?.data?.message || 'Не удалось создать отряд.'}`, ephemeral: true });
        }
    }
};
