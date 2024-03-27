/* eslint-disable no-fallthrough */
import {
  type User,
  type CommandInteraction,
  type Role,
  type PermissionResolvable,
  type ColorResolvable,
  AuditLogEvent,
  PermissionsBitField,
  resolveColor,
  SnowflakeUtil,
} from "discord.js";
import dayjs from "dayjs";
import {
  EventType,
  TimePeriod,
  type RoleChange,
  type RoleChangeChanges,
} from "../types";
import { saveToFs } from "../utils/save-to-fs";
import { extractParams } from "../utils/extract-params";
import { AuditLogsLimit } from "../constants";

export const listRolesChangesHandler = async (
  interaction: CommandInteraction,
) => {
  const { guild, options } = interaction;

  await interaction.reply({
    content: "Fetching roles changelog...",
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
  });

  const roleEvents = [
    AuditLogEvent.RoleCreate,
    AuditLogEvent.RoleDelete,
    AuditLogEvent.RoleUpdate,
  ];

  const rolesChanged: RoleChange[] = [];

  logs?.entries
    .filter((entry) => roleEvents.includes(entry.action))
    .forEach((entry) => {
      const executor = entry.executor as User;
      const target = entry.target as Role;

      let eventType: EventType;

      switch (entry.action) {
        case AuditLogEvent.RoleCreate:
          eventType = "RoleCreate";
          break;
        case AuditLogEvent.RoleDelete:
          eventType = "RoleDelete";
          break;
        default:
          eventType = "RoleUpdate";
          break;
      }

      const changeRecord: RoleChange = {
        auditLogId: entry.id,
        eventType,
        executor: {
          id: executor.id,
          username: executor.username,
        },
        target: {
          id: target.id,
          rolename: target?.name,
        },
        changedAt: new Date(entry.createdTimestamp),
        changes: {} as RoleChangeChanges,
      };

      entry.changes.forEach((change) => {
        const key = change.key as keyof RoleChangeChanges;

        switch (key) {
          case "name":
          case "mentionable":
          case "hoist":
          case "icon":
          case "unicodeEmoji": {
            const changeKey = key as Exclude<
              keyof RoleChangeChanges,
              "color" | "permissions"
            >;

            changeRecord.changes[changeKey] = change;
            break;
          }
          case "color": {
            const oldColor = change?.old
              ? resolveColor(change.old as ColorResolvable)
              : undefined;

            const newColor = change?.new
              ? resolveColor(change?.new as ColorResolvable)
              : undefined;

            changeRecord.changes.color = {
              key: "color",
              old: oldColor?.toString(16),
              new: newColor?.toString(16),
            };
            break;
          }
          case "permissions": {
            const oldPermissions = new PermissionsBitField(
              change?.old as PermissionResolvable,
            );

            const newPermissions = new PermissionsBitField(
              change.new as PermissionResolvable,
            );

            changeRecord.changes.permissions = {
              old: oldPermissions.toArray(),
              new: newPermissions.toArray(),
            };

            break;
          }
          default: {
            console.log(`Change ${change.key} not handled`);
            break;
          }
        }
      });

      rolesChanged.push(changeRecord);
    });

  saveToFs("roles-changes.json", JSON.stringify(rolesChanged, null, 2));

  await interaction.followUp({
    content: "Roles changes saved to filesystem",
    ephemeral: true,
  });
};
