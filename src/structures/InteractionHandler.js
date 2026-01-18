class InteractionHandler {
    constructor(options) {
        this.name = options.name; // ID действия (например, 'join-squad')
        this.enabled = options.enabled ?? true;
    }

    async execute(interaction, client) {
        throw new Error(`Handler ${this.name} does not have an execute method.`);
    }
}

module.exports = InteractionHandler;