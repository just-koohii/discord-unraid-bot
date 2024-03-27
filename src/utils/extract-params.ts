import { CommandInteractionOption } from "discord.js";

export const extractParams = <Params extends Record<string, any>>(
  options: Readonly<CommandInteractionOption[]>,
) => {
  return Object.fromEntries(
    options.map((option) => [option.name, option.value]),
  ) as Params;
};
