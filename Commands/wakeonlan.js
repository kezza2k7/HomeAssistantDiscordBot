const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { longLifeToken, homeAddress, wakeonlanPCMac } = require("../config.json");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("wakeonlan")
        .setDescription("Wake a device on the network"),
    async execute(interaction) {
        const pingingEmbed = new EmbedBuilder()
            .setColor("#9d9d9d")
            .setTitle("Sending the Request...");

        await interaction.reply({
            embeds: [pingingEmbed],
            fetchReply: true,
            ephemeral: true,
        });

        const response = await fetch(`${homeAddress}/api/services/wake_on_lan/send_magic_packet`, {
            method: 'POST',
            headers: { 
            Authorization: `Bearer ${longLifeToken}`,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({"mac": `${wakeonlanPCMac}`}) // Add an empty body
        })

        const pingEmbed = new EmbedBuilder()
            .setColor("#53a653")
            .setTitle("Request Complete")
            .setDescription(
                `We have sent a WakeOnLan Request through HomeAssistant for ${wakeonlanPCMac}.`,
            );

        await interaction.editReply({
            embeds: [pingEmbed],
        });
    },
};
