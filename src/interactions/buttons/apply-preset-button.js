const { ButtonInteraction, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const Bot = require('../../Bot');

module.exports = {
    name: 'event_apply-preset',

    /**
     * @param {ButtonInteraction} interaction
     * @param {Bot} client
     */
    async execute(interaction, client) {
        console.log(`[Handler /apply-preset-button.js] -> Button clicked by ${interaction.user.tag}`);

        const isAllowed = await client.checkPermissions(interaction);
        if (!isAllowed) {
            console.log(`[Handler /apply-preset-button.js] -> User ${interaction.user.tag} has no permissions.`);
            return interaction.reply({
                content: "❌ У вас нет прав для управления этим событием.",
                ephemeral: true
            });
        }
        console.log(`[Handler /apply-preset-button.js] -> User ${interaction.user.tag} has permissions.`);
        
        await interaction.deferReply({ ephemeral: true });

        const eventId = interaction.customId.split('_')[2];

        try {
            console.log('[Handler /apply-preset-button.js] -> Fetching presets from API...');
            const response = await client.api.getPresets(interaction.guild.id);
            const presets = response.data.data;

            if (!presets || presets.length === 0) {
                console.log('[Handler /apply-preset-button.js] -> No presets found for this guild.');
                return interaction.followUp({ content: '❌ На этом сервере еще не создано ни одного пресета.', ephemeral: true });
            }
            console.log(`[Handler /apply-preset-button.js] -> Found ${presets.length} presets.`);

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`preset_apply_${eventId}`)
                .setPlaceholder('Выберите пресет для применения')
                .addOptions(presets.map(preset => ({
                    label: preset.name,
                    // ИСПРАВЛЕНО: Используем preset.structure.length
                    description: `Создает ${preset.structure.length} отряда.`,
                    value: preset.id.toString(),
                })));

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.followUp({
                content: 'Выберите пресет, чтобы **заменить** текущие отряды на отряды из пресета:',
                components: [row],
                ephemeral: true,
            });
            console.log('[Handler /apply-preset-button.js] -> Select menu sent to user.');

        } catch (error) {
            console.error('[Handler /apply-preset-button.js] -> ❌ API Error:', error.response?.data || error.message);
            await interaction.followUp({ content: '❌ Не удалось загрузить список пресетов.', ephemeral: true });
        }
    }
};
