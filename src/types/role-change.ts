import { type AuditLogChange, type PermissionsString } from "discord.js";

export type EventType = "RoleCreate" | "RoleDelete" | "RoleUpdate";

export type RoleChangeChanges = {
  name?: AuditLogChange;
  mentionable?: AuditLogChange;
  hoist?: AuditLogChange;
  color?: AuditLogChange;
  permissions?: {
    old?: PermissionsString[];
    new: PermissionsString[];
  };
  icon?: AuditLogChange;
  unicodeEmoji?: AuditLogChange;
};

export type RoleChange = {
  auditLogId: string;
  eventType: EventType;
  executor: {
    id: string;
    username: string;
  };
  target: {
    id: string;
    rolename?: string;
  };
  changes: RoleChangeChanges;
  changedAt: Date;
};
