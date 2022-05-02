const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "disconnect",
  description: "Arrêtez la musique et laissez le canal vocal",
  usage: "",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["leave", "exit", "quit", "dc", "stop"],
  /**
   *
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {import("discord.js").Message} message
   * @param {string[]} args
   * @param {*} param3
   */
  run: async (client, message, args, { GuildDB }) => {
    let player = await client.Manager.get(message.guild.id);
    if (!message.member.voice.channel)
      return client.sendTime(
        message.channel,
        "❌ | **Vous devez être dans un canal vocal pour utiliser cette commande.**"
      );
    if (!player)
      return client.sendTime(
        message.channel,
        "❌ | **Rien n'est joué en ce moment...**"
      );
    await client.sendTime(message.channel, ":notes: | **Déconnecté !**");
    await message.react("✅");
    player.destroy();
  },

  SlashCommand: {
    /**
     *
     * @param {import("../structures/DiscordMusicBot")} client
     * @param {import("discord.js").Message} message
     * @param {string[]} args
     * @param {*} param3
     */
    run: async (client, interaction, args, { GuildDB }) => {
      const guild = client.guilds.cache.get(interaction.guild_id);
      const member = guild.members.cache.get(interaction.member.user.id);

      if (!member.voice.channel)
        return client.sendTime(
          interaction,
          "❌ | **Vous devez être dans un canal vocal pour utiliser cette commande..**"
        );
      if (
        guild.me.voice.channel &&
        !guild.me.voice.channel.equals(member.voice.channel)
      )
        return client.sendTime(
          interaction,
          `❌ | **Rien n'est joué en ce moment ${guild.me.voice.channel} pour utiliser cette commande.**`
        );

      let player = await client.Manager.get(interaction.guild_id);
      if (!player)
        return client.sendTime(
          interaction,
          "❌ | **Rien n'est joué en ce moment...**"
        );
      player.destroy();
      client.sendTime(interaction, ":notes: | **Déconnecté !**");
    },
  },
};
