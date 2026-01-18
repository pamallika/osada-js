const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'create-modal', // Соответствует customId в модалке
    async execute(interaction, client) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const { fields } = interaction;

        // Современный деструктуринг конфига отрядов
        const squads = fields.getTextInputValue('squads_config')
            .split(',')
            .map(s => {
                const [title, slots] = s.split(':');
                return {
                    title: title?.trim(),
                    slots: parseInt(slots?.trim()) || 0
                };
            });

        const eventData = {
            discord_guild_id: interaction.guild.id,
            region: fields.getTextInputValue('region'),
            start_at: fields.getTextInputValue('start_at'),
            total_slots: squads.reduce((acc, s) => acc + s.slots, 0),
            squads,
            is_free_registration: ['да', '1', '+', 'yes'].includes(
                fields.getTextInputValue('is_free_registration').toLowerCase()
            )
        };

        const { data: { data: event } } = await client.api.createEvent(eventData);

        // Рендерим админку через сервис, который мы прокинули в client
        const panel = client.embeds.renderAdminPanel(event);

        await interaction.channel.send(panel);
        await interaction.editReply("✅ Ивент успешно создан и панель управления отправлена!");
    }
};