import "dotenv/config";
import { Client, type CommandInteraction, REST } from "discord.js";
import { loadCommands } from "./load-commands";
import { Command } from "./commands";
import { listRolesChangesHandler } from "./handlers/list-roles-changes";
import { restoreRoleFromLogHandler } from "./handlers/restore-role-from-log";
import { listBansHandler } from "./handlers/list-bans";
import { extractRoleFromLogHandler } from "./handlers/extract-role-from-log";

const main = async () => {
  if (!process.env?.BOT_TOKEN) {
    throw new Error("BOT_TOKEN env is not defined");
  }

  const client = new Client({
    intents: ["Guilds"],
  });

  const api = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

  client.once("ready", () => {
    console.log(`Logged in as ${client.user?.tag}`);
  });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
      const commandName = interaction.commandName as Command;

      try {
        if (!interaction.memberPermissions?.has("Administrator", true)) {
          await interaction.reply({
            content:
              "You don't have the required permissions to run this command",
            ephemeral: true,
          });

          return;
        }

        if (!interaction.appPermissions?.has("Administrator", true)) {
          await interaction.reply({
            content:
              "Bot doesn't have the required permissions to run this command, please enable the `Administrator` permission",
            ephemeral: true,
          });

          return;
        }

        let handler: (interaction: CommandInteraction) => Promise<void>;

        switch (commandName) {
          case "list-roles-changes": {
            handler = listRolesChangesHandler;
            break;
          }
          case "restore-role-from-log": {
            handler = restoreRoleFromLogHandler;
            break;
          }
          case "extract-role-from-log": {
            handler = extractRoleFromLogHandler;
            break;
          }
          default:
            handler = listBansHandler;
        }

        await handler(interaction);
      } catch (error) {
        console.error(error);

        interaction.channel?.send(
          `Failed to run command ${commandName}, please check the application logs`,
        );
      }
    }
  });

  await client.login(process.env.BOT_TOKEN);

  await loadCommands(api);
};

main();
