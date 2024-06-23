const path = require("path");

module.exports = {
    name: "interactionCreate",
    execute: async (interaction) => {
        if (interaction.isAutocomplete()) {
            let command = interaction.client.commands.get(
                interaction.commandName,
            );
            if (!command) {
                command = await searchFile(
                    path.resolve(__dirname, "../../Commands"),
                    `${interaction.commandName}.js`,
                );
                command = require(command)
                if (!command) {
                    console.error(
                        `No command matching ${interaction.commandName} was found.`,
                    );
                    return;
                }
            }
            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(error);
            }
            return;
        }

        const client = interaction.client;

        if (interaction.isCommand()) {
            let command = client.commands.get(interaction.commandName);
            if (!command) {
                console.error(
                    `No command matching ${interaction.commandName} was found.`,
                );
                await interaction.reply({
                    content: `Command ${interaction.commandName} not found.`,
                    ephemeral: true,
                });
                return;
            }
            console.log(`Interaction Requested: ${interaction.commandName} (Success)`);
            try {
                await command.execute(interaction);
                console.log(`Executed Command: ${interaction.commandName} (Success)`);
            } catch (e) {
                console.error(
                    `Error while Executing Command ${interaction.commandName}: ${e}`,
                );
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({
                        content:
                            "There was an error running that command. Try again later, or if the error persists, let us know.",
                    });
                } else {
                    await interaction.reply({
                        content:
                            "There was an error running that command. Try again later, or if the error persists, let us know.",
                    });
                }
            }
        }
        return;
    },
};
