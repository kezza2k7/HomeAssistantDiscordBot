const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { longLifeToken, homeAddress } = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("button")
        .setDescription("Press a button")
        .addStringOption((option) =>
            option
                .setName("button")
                .setDescription("What button would you like to press?")
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

        responseData = responseData.filter((entity) => entity.entity_id.startsWith("input_button."));

        responseData = responseData.map((entity) => entity.entity_id.replace("input_button.", ""));

        const filtered = responseData.filter(choice => choice.startsWith(focusedOption.value)).slice(0, 25);
        await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
    },
    async execute(interaction) {
        const buttonName = interaction.options.getString("button");

        const pingingEmbed = new EmbedBuilder()
            .setColor("#9d9d9d")
            .setTitle("Pressing the button...");

        await interaction.reply({
            embeds: [pingingEmbed],
            fetchReply: true,
            ephemeral: true,
        });

        const response = await fetch(`${homeAddress}/api/services/input_button/press`, {
            method: 'POST',
            headers: { 
            Authorization: `Bearer ${longLifeToken}`,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({"entity_id": `input_button.${buttonName}`})
        })

        const responseData = await response.json();

        if(responseData.length === 0) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff4d4d")
                .setTitle("Error")
                .setDescription(
                    `There was an error pressing the button ${buttonName}. Please try again later.`,
                );

            await interaction.editReply({
                embeds: [errorEmbed],
            });

            return;
        }

        const pingEmbed = new EmbedBuilder()
            .setColor("#53a653")
            .setTitle("Button Pressed")
            .setDescription(
                `You have pressed: ${responseData[0].entity_id}.`,
            );

        await interaction.editReply({
            embeds: [pingEmbed],
        });
    },
};
