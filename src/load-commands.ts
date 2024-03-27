import { Routes, type REST } from "discord.js";
import { commands } from "./commands";

export const loadCommands = async (api: REST) => {
  await api.put(Routes.applicationCommands(process.env.BOT_ID as string), {
    body: commands,
  });
};
