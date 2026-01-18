const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

class EmbedService {
    // Хелпер для создания прогресс-бара [████░░░░░░]
    _createProgressBar(current, total) {
        const size = 10;
        const progress = Math.round((current / total) * size);
        const emptyProgress = size - progress;

        const progressText = '█'.repeat(Math.max(0, progress));
        const emptyProgressText = '░'.repeat(Math.max(0, emptyProgress));

        return `\`[${progressText}${emptyProgressText}]\` ${current}/${total}`;
    }

    /**
     * Админ-панель (Пульт управления)
     */
    renderAdminPanel(event) {
        const embed = new EmbedBuilder()
            .setTitle(`🛠 Управление осадным ивентом #${event.id}`)
            .setDescription(`**Регион:** ${event.region.toUpperCase()}\n**Дата:** \`${event.start_at}\``)
            .addFields(
                { name: '📊 Статус', value: `\`${event.status.toUpperCase()}\``, inline: true },
                { name: '👥 Всего мест', value: this._createProgressBar(event.stats.total_filled, event.total_slots), inline: true }
            )
            .setTimestamp()
            .setColor(event.status === 'published' ? 0x2ecc71 : 0x34495e);

        const isInactive = ['cancelled', 'completed'].includes(event.status);

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`event_publish_${event.id}`)
                .setLabel('Опубликовать')
                .setStyle(ButtonStyle.Success)
                .setDisabled(event.status !== 'draft' || isInactive),
            new ButtonBuilder()
                .setCustomId(`event_apply-preset_${event.id}`)
                .setLabel('Применить пресет')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(isInactive)
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`event_cancel_${event.id}`)
                .setLabel('Отменить ивент')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(isInactive)
        );

        return { embeds: [embed], components: [row1, row2] };
    }

    /**
     * Публичный Embed для игроков (Осада)
     */
    renderPublicEvent(event) {
        const timestamp = Math.floor(new Date(event.start_at).getTime() / 1000);

        const embed = new EmbedBuilder()
            .setTitle(`⚔️ ОСАДА: ${event.region.toUpperCase()}`)
            .setDescription(`> **Начало:** <t:${timestamp}:F>\n> **До старта:** <t:${timestamp}:R>`)
            .setColor(event.is_free_registration ? 0x3498db : 0xf1c40f)
            .setFooter({ text: `ID: ${event.id} • Системное уведомление` })
            .setThumbnail('https://i.imgur.com/8pY6X0s.png'); // Замени на логотип своей гильдии

        // Отрисовка отрядов через Fields
        event.squads.forEach(squad => {
            const participantCount = squad.participants.length;
            const participantsList = participantCount > 0
                ? squad.participants.map(p => `\`•\` ${p.display_name}`).join('\n')
                : '*Ожидание бойцов...*';

            embed.addFields({
                name: `${squad.title} (${participantCount}/${squad.slots_limit})`,
                value: `${participantsList}\n\u200b`, // \u200b - невидимый символ для отступа
                inline: true
            });
        });

        // Резерв
        if (event.reserve && event.reserve.length > 0) {
            embed.addFields({
                name: `📦 Резерв (${event.reserve.length})`,
                value: event.reserve.map(p => `\`•\` ${p.display_name}`).join(', '),
                inline: false
            });
        }

        const rows = [];

        // Кнопки записи в отряды (в один ряд до 5 штук)
        if (event.is_free_registration && event.status !== 'cancelled') {
            let squadRow = new ActionRowBuilder();
            event.squads.forEach((squad, index) => {
                squadRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`event_join-squad_${squad.id}`)
                        .setLabel(squad.title)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(squad.participants.length >= squad.slots_limit)
                );

                if (squadRow.components.length === 5 || index === event.squads.length - 1) {
                    rows.push(squadRow);
                    squadRow = new ActionRowBuilder();
                }
            });
        }

        // Кнопки управления участием
        if (event.status !== 'cancelled') {
            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`event_reserve_${event.id}`)
                    .setLabel('В Резерв')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`event_decline_${event.id}`)
                    .setLabel('Не смогу')
                    .setStyle(ButtonStyle.Danger)
            );
            rows.push(actionRow);
        } else {
            embed.setColor(0xe74c3c).setTitle(`❌ ОСАДА ОТМЕНЕНА: ${event.region.toUpperCase()}`);
        }

        return { embeds: [embed], components: rows };
    }

    /**
     * Селектор пресетов
     */
    renderPresetSelector(event, presets) {
        return {
            content: "### 📑 Настройка состава\nВыберите целевой отряд и подготовленный пресет.",
            components: [
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`event_select-squad-for-preset_${event.id}`)
                        .setPlaceholder('🎯 Выберите отряд')
                        .addOptions(event.squads.map(s => ({ label: s.title, value: String(s.id), description: `Мест: ${s.slots_limit}` })))
                ),
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`event_select-preset-id_${event.id}`)
                        .setPlaceholder('📋 Выберите пресет')
                        .addOptions(presets.map(p => ({ label: p.name, value: String(p.id) })))
                ),
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`event_confirm-preset_${event.id}`)
                        .setLabel('Применить к отряду')
                        .setStyle(ButtonStyle.Primary)
                )
            ],
            ephemeral: true
        };
    }

    renderSetupDashboard(guild, settings) {
        const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

        const publicChannel = settings?.public_channel_id ? `<#${settings.public_channel_id}>` : '❌ *Не указан*';
        const roles = settings?.officer_role_ids?.length > 0
            ? settings.officer_role_ids.map(id => `<@&${id}>`).join(', ')
            : '❌ *Не указаны (только админы)*';

        const embed = new EmbedBuilder()
            .setTitle('⚙️ Центр управления гильдией')
            .setThumbnail(guild.iconURL())
            .setDescription('Настройки успешно обновлены и сохранены в базе данных.')
            .addFields(
                { name: '📢 Канал анонсов', value: publicChannel, inline: false },
                { name: '🛡️ Офицерские роли', value: roles, inline: false },
            )
            .setColor(settings?.public_channel_id ? 0x2ecc71 : 0xe74c3c)
            .setFooter({ text: `ID Сервера: ${guild.id}` });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('event_setup-channels')
                .setLabel('Каналы')
                .setEmoji('📺')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('event_setup-roles')
                .setLabel('Роли')
                .setEmoji('🛡️')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('event_setup-presets') // НОВАЯ КНОПКА
                .setLabel('Пресеты отрядов')
                .setEmoji('📋')
                .setStyle(ButtonStyle.Primary)
        );

        return { embeds: [embed], components: [row] };
    }
}

module.exports = new EmbedService();