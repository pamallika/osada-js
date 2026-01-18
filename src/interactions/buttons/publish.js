const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'publish',
    async execute(interaction, client) {
        const isAllowed = await client.checkPermissions(interaction);
        if (!isAllowed) {
            return interaction.reply({
                content: "❌ У вас нет прав для управления этим ивентом.",
                ephemeral: true
            });
        }
        await interaction.deferUpdate();
        const eventId = interaction.customId.split('_')[2];

        // 1. Посылаем запрос на публикацию в API
        const { data: { data: event } } = await client.api.publishEvent(eventId);

        if (!event.public_channel_id) {
            return interaction.followUp({
                content: "❌ Публичный канал не настроен в /setup!",
                flags: [MessageFlags.Ephemeral]
            });
        }

        // 2. Отправляем в публичный канал
        const publicChannel = await interaction.guild.channels.fetch(event.public_channel_id);
        const publicView = client.embeds.renderPublicEvent(event);
        const publicMsg = await publicChannel.send(publicView);

        // 3. Сохраняем ID сообщения в БД
        await client.api.updateMessageId(eventId, publicMsg.id);

        // 4. Обновляем админ-панель (кнопка "Опубликовать" теперь заблокирована)
        const adminView = client.embeds.renderAdminPanel(event);
        await interaction.editReply(adminView);
    }
};