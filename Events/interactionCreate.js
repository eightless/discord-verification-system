const client = require('../index');
const Discord = require('discord.js');
const { Captcha } = require('captcha-canvas');

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === 'verify') {
      if (interaction.member.roles.cache.has(mainRole))
        return interaction.reply({
          content: '✅ **You are already verified.**',
          ephemeral: true,
        });
      interaction.deferUpdate({ ephemeral: true });

      const captcha = new Captcha();
      captcha.async = true;
      captcha.addDecoy();
      captcha.drawTrace();
      captcha.drawCaptcha();

      let attachment = new Discord.MessageAttachment(
        await captcha.png,
        'captcha.png'
      );

      let captchaEmbed = new Discord.MessageEmbed()
        .setTitle(`Hello! Are you human? Let's find out!`)
        .setDescription(
          `Please type the captcha above to be able to access this server.\n\n**Additional Notes**:\n<:right:882338961358475314> Type out the traced colored characters from left to right.\n<:detective:882338961517858826> Ignore the decoy characters spread-around.\n<:lowercase:882338961509482636> You have to consider characters cases (upper/lower case).`
        )
        .setColor('PURPLE')
        .setImage('attachment://captcha.png')
        .setFooter({ text: 'Verification Period: 2 minutes' });

      let failEmbed = new Discord.MessageEmbed()
        .setTitle("I couldn't send direct message to you!")
        .setDescription(
          '⚠ You have DMs turned off. Please turn them on using the instruction below.'
        )
        .setImage('https://i.postimg.cc/0jG6XQVV/how-to-enable-dms.png')
        .setColor('YELLOW')
        .setFooter({
          text: `${interaction.guild.name}`,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        });
      console.log(captcha.text);
      const msg = await interaction.user
        .send({
          embeds: [captchaEmbed],
          files: [attachment],
        })
        .catch((error) => {
          interaction.followUp({
            content: `${interaction.user}`,
            embeds: [failEmbed],
            ephemeral: true,
          });
        });
      try {
        let filter = (m) => {
          if (m.author.bot || m.author.id !== interaction.user.id) return;
          if (m.content === captcha.text) return true;
          else {
            m.channel.send({
              content: 'You did not pass the verification. Please try again.',
            });
          }
        };
        let res = await msg.channel.awaitMessages({
          filter,
          max: 1,
          time: 120000,
          errors: ['time'],
        });
        if (res) {
          let successEmbed = new Discord.MessageEmbed()
            .setTitle(`**Verification Success**`)
            .setColor('GREEN')
            .setDescription(
              `Thank you for verifying! You are now a full-fledged member of the server!\nFeel free to choose what roles you’d like, introduce yourself or check out our other channels.\n\n**Your captcha is your signature that you have read and understood our rules.**\n`
            )
            .setFooter({
              text: `${interaction.guild.name}`,
              iconURL: interaction.guild.iconURL({ dynamic: true }),
            });
          msg.channel.send({
            embeds: [successEmbed],
          });
          interaction.member.roles.add(mainRole);
        }
      } catch (err) {
        msg?.channel.send({
          content:
            'Session expired. To start the verification process again, please go to <#878557898194714634>.',
        });
      }
    }
  }
});
