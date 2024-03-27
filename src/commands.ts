import { SlashCommandBuilder } from "discord.js";

export type Command =
  | "list-bans"
  | "list-roles-changes"
  | "restore-role-from-log"
  | "extract-role-from-log";

const listBansCommand = new SlashCommandBuilder()
  .setName("list-bans")
  .setDescription("List all the bans in the server given a date range")
  .addStringOption((option) =>
    option
      .setName("before")
      .setDescription(
        "Search for logs before a specific date, format: YYYY-MM-DD",
      )
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName("after")
      .setDescription(
        "Search for logs before a specific date, format: YYYY-MM-DD",
      )
      .setRequired(false),
  );

const listRolesCommand = new SlashCommandBuilder()
  .setName("list-roles-changes")
  .setDescription("Lists all the roles changes")
  .addStringOption((option) =>
    option
      .setName("before")
      .setDescription(
        "Search for logs before a specific date, format: YYYY-MM-DD",
      )
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName("after")
      .setDescription(
        "Search for logs before a specific date, format: YYYY-MM-DD",
      )
      .setRequired(false),
  );

const restoreRoleCommand = new SlashCommandBuilder()
  .setName("restore-role-from-log")
  .setDescription("Restores a role using an audit log")
  .addStringOption((option) =>
    option
      .setName("role-id")
      .setDescription(
        "Role id to search for, use /list-roles-changes to get the id",
      )
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("audit-log-id")
      .setDescription("Audit log to search for")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("before")
      .setDescription(
        "Search for logs before a specific date, format: YYYY-MM-DD",
      )
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName("after")
      .setDescription(
        "Search for logs before a specific date, format: YYYY-MM-DD",
      )
      .setRequired(false),
  );

const extractRoleCommand = new SlashCommandBuilder()
  .setName("extract-role-from-log")
  .setDescription("Extract a role's data using an audit log")
  .addStringOption((option) =>
    option
      .setName("role-id")
      .setDescription(
        "Role id to search for, use /list-roles-changes to get the id",
      )
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("audit-log-id")
      .setDescription("Audit log to search for")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("before")
      .setDescription(
        "Search for logs before a specific date, format: YYYY-MM-DD",
      )
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName("after")
      .setDescription(
        "Search for logs before a specific date, format: YYYY-MM-DD",
      )
      .setRequired(false),
  );

export const commands = [
  listRolesCommand.toJSON(),
  restoreRoleCommand.toJSON(),
  extractRoleCommand.toJSON(),
  listBansCommand.toJSON(),
];
