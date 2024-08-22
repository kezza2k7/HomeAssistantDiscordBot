const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { longLifeToken, homeAddress } = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sensor")
        .setDescription("Gets data from a sensor")
        .addStringOption((option) =>
            option
                .setName("sensor")
                .setDescription("What sensor would you like to get data from?")
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

        responseData = responseData.filter((entity) => entity.entity_id.startsWith("sensor."));

        responseData = responseData.map((entity) => entity.entity_id.replace("sensor.", ""));

        const filtered = responseData.filter(choice => choice.startsWith(focusedOption.value)).slice(0, 25);
        await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
    },
    async execute(interaction) {
        const sensorName = interaction.options.getString("sensor");

        const pingingEmbed = new EmbedBuilder()
            .setColor("#9d9d9d")
            .setTitle("Getting Sensor Data...");

        await interaction.reply({
            embeds: [pingingEmbed],
            fetchReply: true,
            ephemeral: true,
        });

        const response = await fetch(`${homeAddress}/api/states/sensor.${sensorName}`, {
            method: 'GET',
            headers: { 
            Authorization: `Bearer ${longLifeToken}`,
            'Content-Type': 'application/json'
            },
        })

        const responseData = await response.json();

        if(responseData.length === 0) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff4d4d")
                .setTitle("Error")
                .setDescription(
                    `There was an error getting sensor data from ${sensorName}. Please try again later.`,
                );

            await interaction.editReply({
                embeds: [errorEmbed],
            });

            return;
        }

        const startDate = new Date('1970-01-01T00:00:00Z');
        const lastUpdated = new Date(responseData.last_updated);

        const secondsSince2000 = Math.floor((lastUpdated - startDate) / 1000);

        const pingEmbed = new EmbedBuilder()
            .setColor("#53a653")
            .setTitle("Sensor Data")
            .setDescription(
            `${sensorName}\nState: ${responseData.state}\nLast Updated: <t:${secondsSince2000}:R>`,
            );

        await interaction.editReply({
            embeds: [pingEmbed],
        });
    },
};
