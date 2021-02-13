import { CommandoMessage } from 'discord.js-commando';
import { RoleLevel } from '@Floor-Gang/modmail-types';
import { TextChannel } from 'discord.js';
import Command from '../../models/command';
import Modmail from '../../Modmail';
import { Requires } from '../../util/Perms';
import LogUtil from '../../util/Logging';

export default class ActivateCategory extends Command {
  constructor(client: Modmail) {
    super(client, {
      name: 'activate',
      aliases: [],
      description: 'Reactivate a category',
      group: 'category',
      guildOnly: true,
      memberName: 'activate',
      args: [],
    });
  }

  @Requires(RoleLevel.Admin)
  public async run(msg: CommandoMessage): Promise<null> {
    const modmail = Modmail.getModmail();
    const category = await modmail.categories.getByGuild(msg.guild?.id || '');
    const channel = await msg.channel as TextChannel;

    if (category === null) {
      const res = 'Couldn\'t find a category for this guild.';
      LogUtil.cmdWarn(msg, res);
      await msg.say(res);
      return null;
    }

    if (channel.parent === null) {
      const res = 'You must be under a category channel';
      LogUtil.cmdWarn(msg, res);
      await msg.say(res);
      return null;
    }

    try {
      await category.reactivate(channel.parent.id);
      await msg.say('Reactivated.');
    } catch (_) {
      await msg.say(
        'Failed to reactivate, is this category already being used?',
      );
    }
    return null;
  }
}
