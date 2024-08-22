const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { longLifeToken, homeAddress } = require("../config.json");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("status")
        .setDescription("Get the current API Status"),

    async execute(interaction) {
        const pingingEmbed = new EmbedBuilder()
            .setColor("#9d9d9d")
            .setTitle("Testing the API Status...");

        await interaction.reply({
            embeds: [pingingEmbed],
            fetchReply: true,
            ephemeral: true,
        });

        const response = await fetch(`${homeAddress}/api/`, {
            method: 'GET',
            headers: { 
            Authorization: `Bearer ${longLifeToken}`,
            'Content-Type': 'application/json'
            },
        })

        if(response.ok){
            const successEmbed = new EmbedBuilder()
                .setColor("#00FF00")
                .setTitle("API is online")
                .setDescription("The Home Assistant API is online and responding to requests.");
            await interaction.editReply({
                embeds: [successEmbed],
                fetchReply: true,
                ephemeral: true,
            });
        } else {
            const errorEmbed = new EmbedBuilder()
                .setColor("#9d9d9d")
                .setTitle("API is offline")
                .setDescription("The Home Assistant API is offline and not responding to requests.");
            await interaction.editReply({
                embeds: [errorEmbed],
                fetchReply: true,
                ephemeral: true,
            });
        }
    },
};
