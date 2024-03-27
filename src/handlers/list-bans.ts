import {
  AuditLogEvent,
  type User,
  type CommandInteraction,
  SnowflakeUtil,
} from "discord.js";
import dayjs from "dayjs";
import { BannedUser, TimePeriod } from "../types";
import { extractParams } from "../utils/extract-params";
import { saveToFs } from "../utils/save-to-fs";
import { AuditLogsLimit } from "../constants";

export const listBansHandler = async (interaction: CommandInteraction) => {
  const { guild, options } = interaction;

  await interaction.reply({
    content: "Extractiong bans from audit logs...",
    ephemeral: true,
  });

  const { before, after } = extractParams<{
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

  const logs = await guild?.fetchAuditLogs<AuditLogEvent>({
    ...period,
    limit: AuditLogsLimit,
    type: AuditLogEvent.MemberBanAdd,
  });

  const bannedUsers: BannedUser[] = [];

  logs?.entries.forEach((entry) => {
    const executor = entry.executor as User;
    const target = entry.target as User;

    bannedUsers.push({
      auditLogId: entry.id,
      executor: {
        id: executor.id,
        username: executor.username,
      },
      target: {
        id: target.id,
        username: target.username,
      },
      bannedAt: new Date(entry.createdTimestamp),
    });
  });

  saveToFs("banned-users.json", JSON.stringify(bannedUsers, null, 2));

  await interaction.followUp({
    content: "Bans  saved to filesystem",
    ephemeral: true,
  });
};
