const axios = require('axios');

class ApiService {
    constructor() {
        this.client = axios.create({
            baseURL: process.env.API_URL || 'http://127.0.0.1:8000/api/discord',
            headers: {'Content-Type': 'application/json'}
        });
    }

    async syncUser(userData) {
        return this.client.post('/users/sync', userData);
    }

    async createEvent(eventData) {
        return this.client.post('/events', eventData);
    }

    async getEventInfo(eventId) {
        return this.client.get(`/events/${eventId}`);
    }

    async createSquad(squadData) {
        const { event_id, ...payload } = squadData;
        return this.client.post(`/events/${event_id}/squads`, payload);
    }

    async applyPresetToEvent(eventId, presetId) {
        return this.client.post(`/events/${eventId}/apply-preset`, { preset_id: presetId });
    }

    async publishEvent(eventId) {
        return this.client.post(`/events/${eventId}/publish`);
    }

    async cancelEvent(eventId) {
        return this.client.post(`/events/${eventId}/cancel`);
    }

    async updateMessageId(eventId, messageId) {
        return this.client.patch(`/events/${eventId}/message`, {
            discord_message_id: messageId
        });
    }

    async recordAction(data) {
        const {event_id, ...payload} = data;
        return this.client.post(`/events/${event_id}/participants`, payload);
    }

    async applyPreset(squadId, presetId) {
        return this.client.post(`/squads/${squadId}/presets`, {preset_id: presetId});
    }

    async setupGuild(data) {
        return this.client.post('/guilds', data);
    }

    async checkAccess(guildId, roles) {
        return this.client.post(`/guilds/${guildId}/access-check`, {roles});
    }

    async getGuildSettings(guildId) {
        return this.client.get(`/guilds/${guildId}`);
    }

    async getPresets(guildId) {
        return this.client.get(`/guilds/${guildId}/presets`);
    }
    async createPreset(data) {
        return this.client.post('/guilds/presets', data);
    }
}

module.exports = new ApiService();
