const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'final-create-modal',
    async execute(interaction, client) {
        // 1. Извлекаем временные данные из кэша
        const cachedData = client.tempSelections.get(interaction.user.id);

        // 2. Извлекаем данные из полей ввода модалки
        const title = interaction.fields.getTextInputValue('event_title');
        const timeStr = interaction.fields.getTextInputValue('event_time');

        if (!cachedData || !cachedData.presetId) {
            return interaction.reply({
                content: "❌ Ошибка: Данные о пресете потеряны. Пожалуйста, начните создание заново через /create-event.",
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            // 3. Получаем данные пресета, чтобы сформировать структуру отрядов
            const presetResponse = await client.api.getPresets(interaction.guild.id);
            const preset = presetResponse.data.data.find(p => p.id == cachedData.presetId);

            if (!preset) {
                throw new Error(`Пресет с ID ${cachedData.presetId} не найден в базе данных.`);
            }

            // 4. Подготовка данных для Laravel
            // Считаем общее кол-во слотов
            const totalSlots = preset.structure.reduce((sum, squad) => sum + squad.slots, 0);

            // Преобразуем структуру пресета под формат сервера (name -> title)
            const formattedSquads = preset.structure.map(squad => ({
                title: squad.name, // Laravel ожидает 'title'
                slots: squad.slots
            }));

            // Формируем финальный объект запроса
            const payload = {
                discord_guild_id: interaction.guild.id,
                creator_id: interaction.user.id,
                title: title,
                region: 'EU',              // Можно вынести в настройки или кэш
                start_at: timeStr,         // Laravel распарсит это в дату
                date_str: timeStr,         // Для отображения в Discord
                total_slots: totalSlots,
                preset_id: parseInt(preset.id, 10),
                squads: formattedSquads,
                is_free_registration: false
            };

            console.log("[DEBUG] Отправка данных на сервер:", JSON.stringify(payload, null, 2));

            // 5. Запрос к API
            const response = await client.api.createEvent(payload);

            // 6. Очистка кэша после успешного создания
            client.tempSelections.delete(interaction.user.id);

            // 7. Красивый ответ пользователю
            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Ивент успешно создан')
                .setColor(0x2ecc71)
                .addFields(
                    { name: 'Название', value: title, inline: true },
                    { name: 'Дата/Время', value: timeStr, inline: true },
                    { name: 'Пресет', value: preset.name, inline: true },
                    { name: 'Всего слотов', value: totalSlots.toString(), inline: true }
                )
                .setFooter({ text: 'Теперь вы можете опубликовать его через админ-панель.' });

            await interaction.editReply({ embeds: [successEmbed] });

        } catch (e) {
            // Детальный вывод ошибок в консоль бота
            console.error("[CRITICAL ERROR] Ошибка при создании ивента:");

            if (e.response && e.response.data) {
                console.error("Ошибки от Laravel:", JSON.stringify(e.response.data.errors, null, 2));

                const serverErrors = e.response.data.errors;
                const errorMessages = serverErrors
                    ? Object.values(serverErrors).flat().join('\n')
                    : e.response.data.message;

                await interaction.editReply({
                    content: `❌ **Ошибка сервера:**\n${errorMessages}`
                });
            } else {
                console.error(e);
                await interaction.editReply({
                    content: `❌ **Ошибка бота:** ${e.message}`
                });
            }
        }
    }
};