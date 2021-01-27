import { Command, CommandoMessage } from 'discord.js-commando';
import { MuteStatus, RoleLevel } from 'modmail-types';
import Modmail from '../../Modmail';
import LogUtil from '../../util/Logging';
import { Requires } from '../../util/Perms';
import Time from '../../util/Time';

type Args = {
  userID: string,
  time: string,
  reason?: string[],
}

export default class Mute extends Command {
  constructor(client: Modmail) {
    super(client, {
      name: 'mute',
      aliases: [],
      description: 'Mute a member',
      guildOnly: true,
      group: 'muting',
      memberName: 'mute',
      args: [
        {
          key: 'userID',
          prompt: 'The user ID to mute',
          type: 'string',
        },
        {
          key: 'time',
          prompt: 'How long to mute them (format: 5d | 5hr | 5m | 5s)',
          type: 'string',
        },
        {
          key: 'reason',
          prompt: 'Reason for mute',
          type: 'string',
          default: '',
          infinite: true,
        },
      ],
    });
  }

  @Requires(RoleLevel.Mod)
  public async run(msg: CommandoMessage, args: Args): Promise<null> {
    const pool = Modmail.getDB();
    const catUtil = Modmail.getCatUtil();
    const category = await catUtil.getCategory(msg);

    if (category === null) {
      const res = 'Please run this command in a guild with an active category.';
      LogUtil.cmdWarn(msg, res);
      msg.say(res);
      return null;
    }

    const mute: MuteStatus = {
      category: category.id,
      reason: args.reason ? args.reason.join(' ') : 'No Reason Provided',
      till: Time.parse(args.time),
      user: args.userID,
    };

    const muted = await pool.mutes.add(mute);
    if (!muted) {
      msg.say('Already muted.');
      return null;
    }
    msg.say('Muted.');
    return null;
  }
}
