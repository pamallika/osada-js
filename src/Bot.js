const { Client, GatewayIntentBits, Collection, REST, Routes, Events, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const api = require('./services/ApiService');
const embedService = require('./services/EmbedService');

class Bot extends Client {
    constructor() {
        super({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages]
        });

        this.api = api;
        this.embeds = embedService;

        this.commands = new Collection();
        this.buttons = new Collection();
        this.modals = new Collection();
        this.selects = new Collection();

        this.tempSelections = new Collection();
    }

    async start(token) {
        this.loadModules('commands');
        this.loadModules('interactions/buttons', this.buttons);
        this.loadModules('interactions/modals', this.modals);
        this.loadModules('interactions/selects', this.selects);

        this.registerEvents();
        await this.login(token);
    }

    loadModules(dir, collection = null) {
        const fullPath = path.join(__dirname, dir);
        if (!fs.existsSync(fullPath)) return;

        const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.js'));
        for (const file of files) {
            try {
                const module = require(path.join(fullPath, file));

                if (typeof module === 'object' && Object.keys(module).length === 0) {
                    continue;
                }

                const instance = typeof module === 'function' ? new module() : module;

                if (collection) {
                    collection.set(instance.name, instance);
                } else {
                    this.commands.set(instance.name, instance);
                }
            } catch (e) {
                // Игнорируем ошибки от "пустых" файлов, которые не являются классами
                if (!e.message.includes('is not a constructor')) {
                     console.error(`[⚠️ Module Load Error] in ${file}:`, e.message);
                }
            }
        }
    }

    registerEvents() {
        this.once(Events.ClientReady, async () => {
            console.log(`[🚀 System] ${this.user.tag} готов к работе`);
            await this.deploySlashCommands();
        });

        this.on(Events.InteractionCreate, async (interaction) => {
            await this.handleInteraction(interaction);
        });
    }

    async handleInteraction(interaction) {
        console.log(`\n[Router] New interaction received. Type: ${interaction.type}, CustomId: ${interaction.customId || 'N/A'}`);

        try {
            await this.api.syncUser({
                discord_id: interaction.user.id,
                username: interaction.user.username,
                global_name: interaction.user.globalName,
                avatar: interaction.user.displayAvatarURL()
            });
            console.log('[Router] User sync successful.');
        } catch (e) {
            console.error("[Router] ⚠️ API Sync Error:", e.message);
        }

        if (interaction.isChatInputCommand()) {
            console.log(`[Router] -> Routing to command: ${interaction.commandName}`);
            return this.routeInteraction(interaction, this.commands, interaction.commandName);
        }

        const customId = interaction.customId;
        if (typeof customId !== 'string' || !customId) {
            return;
        }

        let collection;
        if (interaction.isButton()) collection = this.buttons;
        else if (interaction.isModalSubmit()) collection = this.modals;
        else if (interaction.isAnySelectMenu()) collection = this.selects;
        else return;

        const handlerName = Array.from(collection.keys()).find(key => customId.startsWith(key));
        if (handlerName) {
            console.log(`[Router] -> Found handler: '${handlerName}'. Routing...`);
            return this.routeInteraction(interaction, collection, handlerName);
        } else {
            console.log(`[Router] -> ❌ No handler found for customId: ${customId}`);
        }
    }

    async routeInteraction(interaction, collection, handlerName) {
        const handler = collection.get(handlerName);
        if (!handler) {
            console.error(`[Router] -> ❌ Handler '${handlerName}' not found in collection.`);
            return;
        }

        try {
            await handler.execute(interaction, this);
        } catch (error) {
            console.error(`[Router] -> ❌ Uncaught error in handler '${handlerName}':`, error);
            const message = error.response?.data?.message || "Произошла внутренняя ошибка.";

            const replyOptions = { content: `❌ ${message}`, ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(replyOptions);
            } else {
                await interaction.reply(replyOptions);
            }
        }
    }

    async deploySlashCommands() {
        const rest = new REST({ version: '10' }).setToken(this.token);
        const data = this.commands.map(c => ({
            name: c.name,
            description: c.description,
            options: c.options,
            default_member_permissions: c.name === 'setup' ? PermissionFlagsBits.Administrator.toString() : null
        }));

        try {
            console.log(`[System] Deploying ${data.length} slash commands...`);
            await rest.put(Routes.applicationCommands(this.user.id), { body: data });
            console.log(`[System] Successfully deployed slash commands.`);
        } catch (e) {
            console.error('[🚫 REST Error]:', e.message);
        }
    }

    async checkPermissions(interaction) {
        if (interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return true;
        try {
            const response = await this.api.getGuildSettings(interaction.guild.id);
            const officerRoles = response.data.data?.officer_role_ids || [];
            const hasRole = interaction.member.roles.cache.some(role => officerRoles.includes(role.id));
            return hasRole;
        } catch (e) {
            console.error("[Perms Check Error]:", e.message);
            return false;
        }
    }

    async getSettings(guildId) {
        if (!this.tempSelections.has(`settings_${guildId}`)) {
            const response = await this.api.getGuildSettings(guildId);
            this.tempSelections.set(`settings_${guildId}`, response.data.data);
            setTimeout(() => this.tempSelections.delete(`settings_${guildId}`), 300000);
        }
        return this.tempSelections.get(`settings_${guildId}`);
    }
}

module.exports = Bot;
