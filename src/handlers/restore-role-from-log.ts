import {
  type CommandInteraction,
  type Role,
  type PermissionResolvable,
  type ColorResolvable,
  type RoleCreateOptions,
  type GuildAuditLogsEntry,
  AuditLogEvent,
  PermissionsBitField,
  resolveColor,
  SnowflakeUtil,
} from "discord.js";
import dayjs from "dayjs";
import { extractParams } from "../utils/extract-params";
import { TimePeriod } from "../types";
import { AuditLogsLimit } from "../constants";

export const restoreRoleFromLogHandler = async (
  interaction: CommandInteraction,
) => {
  const { guild, options } = interaction;

  await interaction.reply("Attempting to restore role ");

  const {
    "role-id": roleId,
    "audit-log-id": auditLogId,
    before,
    after,
  } = extractParams<{
    "role-id": string;
    "audit-log-id": string;
    before?: string;
    after?: string;
  }>(options.data);

  const period: TimePeriod = {};

  if (before) {
    period.before = SnowflakeUtil.generate({
      timestamp: dayjs(before).startOf("date").toDate(),
    }).toString();
  }

  if (after) {
    period.after = SnowflakeUtil.generate({
      timestamp: dayjs(after).endOf("date").toDate(),
    }).toString();
  }

  const events = [AuditLogEvent.RoleDelete, AuditLogEvent.RoleUpdate];

  const logs = await guild?.fetchAuditLogs<AuditLogEvent>({
    ...period,
    limit: AuditLogsLimit,
  });

  const log = logs?.entries.filter(
    (entry) =>
      events.includes(entry.action) &&
      entry.id === auditLogId &&
      (entry?.target as Role)?.id === roleId,
  );

  if (log?.size) {
    const entry = log.at(0) as GuildAuditLogsEntry;

    const changeRecord: RoleCreateOptions = {};

    entry.changes.forEach((change) => {
      switch (change.key as keyof RoleCreateOptions) {
        case "name":
        case "mentionable":
        case "hoist":
        case "icon":
        case "unicodeEmoji": {
          // @ts-ignore
          changeRecord[change.key] = change?.old;
          break;
        }

        case "permissions": {
          changeRecord.permissions = new PermissionsBitField(
            change?.old as PermissionResolvable,
          );
          break;
        }
        case "color": {
          const oldColor = change?.old
            ? resolveColor(change.old as ColorResolvable)
            : undefined;

          changeRecord.color = oldColor;
          break;
        }

        default: {
          console.log(`Change ${change.key} not handled`);
          break;
        }
      }
    });

    if (Object.keys(changeRecord).length) {
      await guild?.roles.create(changeRecord);

      await interaction.followUp({
        content: "Role restored",
        ephemeral: true,
      });
    } else {
      await interaction.followUp({
        content: "Nothing to restore",
        ephemeral: true,
      });
    }
  }
};
