const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { longLifeToken, homeAddress } = require("../config.json");
const fs = require("fs");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("fetch")
        .setDescription("Send a fetch request to the Home Assistant API")
        .addStringOption((option) =>
            option
                .setName("type")
                .setDescription("What Type of Request?")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption((option) =>
            option
                .setName("endpoint")
                .setDescription("/api/...")
                .setRequired(true)
        )
        .addStringOption((option) =>    
            option
                .setName("body")
                .setDescription("Body of the Request")
        ),

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        let choices
        if (focusedOption.name === 'type') {
            choices = ['POST', 'GET', 'PUT'];
        }
		const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
        await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
    },
    async execute(interaction) {
        const type = interaction.options.getString("type");
        const endpoint = interaction.options.getString("endpoint");
        let body = interaction.options.getString("body");
        if (!body) {
            body = {};
        }
        
        const pingingEmbed = new EmbedBuilder()
            .setTitle("Sending the Request...")
            .setColor("#9d9d9d");
        
        await interaction.reply({
            embeds: [pingingEmbed],
            fetchReply: true,
            ephemeral: true,
        });
        
        try {
            const response = await fetch(`${homeAddress}${endpoint}`, {
                method: `${type}`,
                headers: {
                    Authorization: `Bearer ${longLifeToken}`,
                    'Content-Type': 'application/json'
                },
                body: type == "GET" ? null : JSON.stringify(body) // Add an empty body
            });
        
            const rawResponseText = await response.text();
            console.log("Raw response text:", rawResponseText);
        
            const responseData = JSON.parse(rawResponseText);
        
            // Save the data in a JSON file
            fs.writeFileSync("response.json", JSON.stringify(responseData));
        
            const pingEmbed = new EmbedBuilder()
                .setColor("#53a653")
                .setTitle("Request Sent")
                .setDescription(
                    `Type: ${type}, EndPoint: ${endpoint}\n${JSON.stringify(responseData, null, 2)}`,
                );
        
            await interaction.editReply({
                embeds: [pingEmbed],
            });
        } catch (e) {
            console.error("Error during fetch or JSON parsing:", e);
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("Error")
                .setDescription(`An error occurred: ${e.message}`);
        
            await interaction.editReply({
                embeds: [errorEmbed],
            });
        }
    },
};
