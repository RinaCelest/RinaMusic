const { DiscordMusicBot } = require("../structures/DiscordMusicBot");
const { VoiceState, MessageEmbed } = require("discord.js");
/**
 *
 * @param {DiscordMusicBot} client
 * @param {VoiceState} oldState
 * @param {VoiceState} newState
 * @returns {Promise<void>}
 */
module.exports = async (client, oldState, newState) => {
  // get guild and player
  let guildId = newState.guild.id;
  const player = client.Manager.get(guildId);

  // check if the bot is active (playing, paused or empty does not matter (return otherwise)
  if (!player || player.state !== "CONNECTED") return;

  // prepreoces the data
  const stateChange = {};
  // get the state change
  if (oldState.channel === null && newState.channel !== null)
    stateChange.type = "JOIN";
  if (oldState.channel !== null && newState.channel === null)
    stateChange.type = "LEAVE";
  if (oldState.channel !== null && newState.channel !== null)
    stateChange.type = "MOVE";
  if (oldState.channel === null && newState.channel === null) return; // you never know, right
  if (newState.serverMute == true && oldState.serverMute == false)
    return player.pause(true);
  if (newState.serverMute == false && oldState.serverMute == true)
    return player.pause(false);
  // move check first as it changes type
  if (stateChange.type === "MOVE") {
    if (oldState.channel.id === player.voiceChannel) stateChange.type = "LEAVE";
    if (newState.channel.id === player.voiceChannel) stateChange.type = "JOIN";
  }
  // double triggered on purpose for MOVE events
  if (stateChange.type === "JOIN") stateChange.channel = newState.channel;
  if (stateChange.type === "LEAVE") stateChange.channel = oldState.channel;

  // check if the bot's voice channel is involved (return otherwise)
  if (!stateChange.channel || stateChange.channel.id !== player.voiceChannel)
    return;

  // filter current users based on being a bot
  stateChange.members = stateChange.channel.members.filter(
    (member) => !member.user.bot
  );

  switch (stateChange.type) {
    case "JOIN":
      if (stateChange.members.size === 1 && player.paused) {
        let emb = new MessageEmbed()
          .setAuthor(`Reprise d'une file d'attente en pause`, client.botconfig.IconURL)
          .setColor(client.botconfig.EmbedColor)
          .setDescription(
            `Reprise de la lecture parce que vous m'avez tous laissé de la musique à jouer tout seul.`
          );
        await client.channels.cache.get(player.textChannel).send(emb);

        // update the now playing message and bring it to the front
        let msg2 = await client.channels.cache
          .get(player.textChannel)
          .send(player.nowPlayingMessage.embeds[0]);
        player.setNowplayingMessage(msg2);

        player.pause(false);
      }
      break;
    case "LEAVE":
      if (stateChange.members.size === 0 && !player.paused && player.playing) {
        player.pause(true);

        let emb = new MessageEmbed()
          .setAuthor(`En pause!`, client.botconfig.IconURL)
          .setColor(client.botconfig.EmbedColor)
          .setDescription(`La lecture a été mis en pause parce que tout le monde est parti`);
        await client.channels.cache.get(player.textChannel).send(emb);
      }
      break;
  }
};
