module.exports = {
    name: 'save-presets-modal',
    async execute(interaction, client) {
        const name = interaction.fields.getTextInputValue('preset_name');
        const structureString = interaction.fields.getTextInputValue('preset_structure');

        console.log(`[Parser Debug] Название: ${name}`);
        console.log(`[Parser Debug] Сырая строка: ${structureString}`);

        const squads = [];
        // Разбиваем строку по запятым или переносам строк
        const lines = structureString.split(/[,\n]/);

        try {
            for (let line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;

                console.log(`[Parser Debug] Обработка строки: "${trimmedLine}"`);

                // Проверяем наличие двоеточия
                if (!trimmedLine.includes(':')) {
                    throw new Error(`Пропущено двоеточие в: "${trimmedLine}"`);
                }

                const [squadName, sizeRaw] = trimmedLine.split(':').map(part => part.trim());
                const size = parseInt(sizeRaw, 10);

                if (!squadName || isNaN(size)) {
                    throw new Error(`Некорректный формат в: "${trimmedLine}". Должно быть Имя:Цифра`);
                }

                squads.push({
                    name: squadName,
                    slots: size
                });
            }

            if (squads.length === 0) throw new Error("Пресет пуст. Введите хотя бы один отряд.");

            console.log(`[Parser Debug] Результат парсинга:`, squads);

            await interaction.deferReply({ ephemeral: true });

            // ВАЖНО: Проверь, как называется метод в ApiService!
            await client.api.createPreset({
                discord_id: interaction.guild.id,
                name: name,
                structure: squads
            });

            await interaction.editReply({
                content: `✅ Пресет **"${name}"** успешно создан!`
            });

        } catch (e) {
            console.error(`[Parser Error]`, e); // Это выведет ошибку в консоль бота

            const message = e.message.includes('Ошибка') || e.message.includes('Формат')
                ? e.message
                : "Не удалось сохранить пресет. Проверьте формат (Название:Число).";

            if (interaction.deferred) {
                await interaction.editReply({ content: `❌ ${message}` });
            } else {
                await interaction.reply({ content: `❌ ${message}`, ephemeral: true });
            }
        }
    }
};