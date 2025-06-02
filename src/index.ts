import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { modifyLayout } from "./modifyLayout";
import { modifyCSS } from "./modifyCSS";

// Predefined options
const FONT_WEIGHTS = [
  "100", "200", "300", "400", "500", "600", "700", "800", "900",
  "normal", "bold"
];

const FONT_SUBSETS = [
  "latin", "latin-ext", "cyrillic", "cyrillic-ext",
  "greek", "greek-ext", "vietnamese", "devanagari"
];

async function isAliasTaken(alias: string) {
  const cssPath = path.resolve("app/globals.css");
  if (!(await fs.pathExists(cssPath))) return false;

  const cssContent = await fs.readFile(cssPath, "utf-8");
  const themeBlockRegex = /@theme\s*{([\s\S]*?)}/m;
  const match = cssContent.match(themeBlockRegex);

  if (!match) return false;

  return match[1].includes(`--font-${alias}`);
}

async function main() {
  const { fontName } = await inquirer.prompt([
    {
      type: "input",
      name: "fontName",
      message: "Enter Google Font name (e.g. Roboto):",
      validate: input => input.trim() ? true : "Font name cannot be empty",
    },
  ]);

  let alias = fontName.toLowerCase();

  // Ask for alias with validation & conflict check
  while (true) {
    const answer = await inquirer.prompt([
      {
        type: "input",
        name: "alias",
        message: `Give "${fontName}" a nickname (e.g. "primary"):`,
        default: alias,
      },
    ]);

    alias = answer.alias.trim();

    if (!alias) {
      console.log(chalk.red("Alias cannot be empty. Please try again."));
      continue;
    }

    if (await isAliasTaken(alias)) {
      console.log(chalk.yellow(`⚠️ Alias "${alias}" already exists. Please choose another.`));
      continue;
    }

    break;
  }

  const { weights, subsets } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "weights",
      message: "Select font weights (space to select):",
      choices: FONT_WEIGHTS,
      default: ["400"],
      validate: input => input.length > 0 ? true : "Select at least one weight",
    },
    {
      type: "checkbox",
      name: "subsets",
      message: "Select font subsets:",
      choices: FONT_SUBSETS,
      default: ["latin"],
      validate: input => input.length > 0 ? true : "Select at least one subset",
    },
  ]);

  await modifyLayout(fontName, alias, weights, subsets);
  await modifyCSS(fontName, alias);

  console.log(chalk.green(`✅ Installed "${fontName}" as "font-${alias}"`));
}

main();
