const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { longLifeToken, homeAddress } = require("../config.json");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("light")
        .setDescription("Toggle the light on and off")
        .addStringOption((option) =>
            option
                .setName("light")
                .setDescription("What Light would you like to toggle?")
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

        responseData = responseData.filter((entity) => entity.entity_id.startsWith("light."));

        responseData = responseData.map((entity) => entity.entity_id.replace("light.", ""));

		const filtered = responseData.filter(choice => choice.startsWith(focusedOption.value));
        await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
    },
    async execute(interaction) {
        const light = interaction.options.getString("light");

        const pingingEmbed = new EmbedBuilder()
            .setColor("#9d9d9d")
            .setTitle("Changing the light status...");

        await interaction.reply({
            embeds: [pingingEmbed],
            fetchReply: true,
            ephemeral: true,
        });

        const response = await fetch(`${homeAddress}/api/services/light/toggle`, {
            method: 'POST',
            headers: { 
            Authorization: `Bearer ${longLifeToken}`,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({"entity_id": `light.${light}`}) // Add an empty body
        })

        const responseData = await response.json();

        if(responseData.length === 0) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff4d4d")
                .setTitle("Error")
                .setDescription(
                    `There was an error toggling the light: ${light}. Please try again later.`,
                );

            await interaction.editReply({
                embeds: [errorEmbed],
            });

            return;
        }

        const pingEmbed = new EmbedBuilder()
            .setColor("#53a653")
            .setTitle("Light Changed")
            .setDescription(
                `You're light: ${responseData[0].entity_id} has been toggled.\nIt is now ${responseData[0].state}.`,
            );

        await interaction.editReply({
            embeds: [pingEmbed],
        });
    },
};
