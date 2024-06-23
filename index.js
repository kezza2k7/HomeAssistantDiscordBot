const { Client, IntentsBitField, Collection, Routes } = require("discord.js");
const { discordToken } = require("./config.json");
const { readdirSync } = require("fs");
const { REST } = require("@discordjs/rest");

intents = new IntentsBitField();
intents.add(
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.MessageContent,
);

var client = new Client({
    intents: intents,
});

// Event Handler
(async () => {
    const eventFiles = readdirSync("./src/events");
    const eventNames = [];

    for (const file of eventFiles) {
        const event = require(`./src/events/${file}`);
        eventNames.push(` ${event.name}`);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }

    console.log(`Events loaded: ${eventNames}`);

    const commandFiles = readdirSync(`./Commands`);

    client.commands = new Collection();
    
    for (const file of commandFiles) {
        const filePath = `./Commands/${file}`;
        const command = require(filePath);

        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }

    await client.login(discordToken).then(() => {
        console.log("Bot logged in");
    });

    const rest = new REST({ version: "9" }).setToken(discordToken);

    const commands = client.commands.map((command) =>
        command.data.toJSON(),
    );

    await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands,
    });

    console.log("Successfully registered application commands.")
})();

console.log("idk")

