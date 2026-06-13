import {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    Routes,
    REST,
    PermissionFlagsBits
} from "discord.js";

// -----------------------------
// VARIABLES RAILWAY
// -----------------------------
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
    console.log("❌ Variables Railway manquantes : TOKEN, CLIENT_ID, GUILD_ID");
    process.exit(1);
}

// -----------------------------
// CLIENT
// -----------------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ]
});

// -----------------------------
// COMMANDE /loveboom
// -----------------------------
const loveboomCommand = new SlashCommandBuilder()
    .setName("loveboom")
    .setDescription("Bannit les membres ayant certains rôles et renomme tous les salons en 'Jtm'.")
    .addRoleOption(option =>
        option.setName("role1")
            .setDescription("Premier rôle à bannir")
            .setRequired(true)
    )
    .addRoleOption(option =>
        option.setName("role2")
            .setDescription("Deuxième rôle (optionnel)")
            .setRequired(false)
    )
    .setDefaultMemberPermissions(
        PermissionFlagsBits.BanMembers |
        PermissionFlagsBits.ManageChannels
    );

// -----------------------------
// ENREGISTREMENT DE LA COMMANDE
// -----------------------------
const rest = new REST({ version: "10" }).setToken(TOKEN);

async function registerCommands() {
    try {
        console.log("🔄 Enregistrement de /loveboom…");

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: [loveboomCommand.toJSON()] }
        );

        console.log("✅ Commande enregistrée !");
    } catch (err) {
        console.error(err);
    }
}

// -----------------------------
// EXECUTION DE LA COMMANDE
// -----------------------------
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "loveboom") return;

    const role1 = interaction.options.getRole("role1");
    const role2 = interaction.options.getRole("role2");

    await interaction.reply("💗 Exécution de l’opération LoveBoom…");

    // --- MASSBAN ---
    const rolesToBan = [role1];
    if (role2) rolesToBan.push(role2);

    const members = await interaction.guild.members.fetch();

    const targets = members.filter(member =>
        rolesToBan.some(role => member.roles.cache.has(role.id))
    );

    let banCount = 0;

    for (const member of targets.values()) {
        try {
            await member.ban({ reason: "LoveBoom massban" });
            banCount++;
        } catch (err) {
            console.error(`Impossible de bannir ${member.user.tag}`);
        }
    }

    // --- RENAME ALL CHANNELS ---
    const channels = interaction.guild.channels.cache;
    let renameCount = 0;

    for (const channel of channels.values()) {
        try {
            await channel.setName("Jtm");
            renameCount++;
        } catch (err) {
            console.error(`Impossible de renommer ${channel.name}`);
        }
    }

    interaction.followUp(
        `✨ **LoveBoom terminé !**  
🔨 Membres bannis : **${banCount}**  
💞 Salons renommés : **${renameCount}**`
    );
});

// -----------------------------
// READY
// -----------------------------
client.on("ready", () => {
    console.log(`🔥 Connecté en tant que ${client.user.tag}`);
});

// -----------------------------
// START
// -----------------------------
registerCommands();
client.login(TOKEN);

