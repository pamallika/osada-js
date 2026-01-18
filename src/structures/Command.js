class Command {
    constructor(options) {
        this.name = options.name;
        this.description = options.description;
        this.options = options.options || [];
        this.category = options.category || 'General';
    }

    async execute(interaction, client) {
        throw new Error(`Command ${this.name} does not have an execute method.`);
    }
}

module.exports = Command;