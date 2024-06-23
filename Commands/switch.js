const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { longLifeToken, homeAddress } = require("../config.json");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("switch")
        .setDescription("Toggle a switch on and off")
        .addStringOption((option) =>
            option
                .setName("switch")
                .setDescription("What Switch would you like to toggle?")
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        const response = await fetch(`${homeAddress}/api/states`, {
            method: `GET`,
            headers: { 
            Authorization: `Bearer ${longLifeToken}`,
            'Content-Type': 'application/json'
            },
        }).catch((e) => {
            console.error(e);
        });

        let responseData = await response.json();

        responseData = responseData.filter((entity) => entity.entity_id.startsWith("switch."));

        responseData = responseData.map((entity) => entity.entity_id.replace("switch.", ""));

		const filtered = responseData.filter(choice => choice.startsWith(focusedOption.value));
        await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
    },
    async execute(interaction) {
        const switche = interaction.options.getString("switch");

        const pingingEmbed = new EmbedBuilder()
            .setColor("#9d9d9d")
            .setTitle("Changing the switch status...");

        await interaction.reply({
            embeds: [pingingEmbed],
            fetchReply: true,
            ephemeral: true,
        });

        const response = await fetch(`${homeAddress}/api/services/switch/toggle`, {
            method: 'POST',
            headers: { 
            Authorization: `Bearer ${longLifeToken}`,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({"entity_id": `switch.${switche}`}) // Add an empty body
        })

        const responseData = await response.json();

        if(responseData.length === 0) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff4d4d")
                .setTitle("Error")
                .setDescription(
                    `There was an error toggling the switch: ${switche}. Please try again later.`,
                );

            await interaction.editReply({
                embeds: [errorEmbed],
            });

            return;
        }

        const pingEmbed = new EmbedBuilder()
            .setColor("#53a653")
            .setTitle("Switch Changed")
            .setDescription(
                `You're switch: ${responseData[0].entity_id} has been toggled.\nIt is now ${responseData[0].state}.`,
            );

        await interaction.editReply({
            embeds: [pingEmbed],
        });
    },
};
