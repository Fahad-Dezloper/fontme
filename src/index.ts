import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { modifyLayout } from './modifyLayout';
import { modifyCSS } from './modifyCSS';

async function isAliasTaken(alias: string) {
  const cssPath = path.resolve('app/globals.css');
  if (!(await fs.pathExists(cssPath))) return false;

  const cssContent = await fs.readFile(cssPath, 'utf-8');
  const themeBlockRegex = /@theme\s*{([\s\S]*?)}/m;
  const match = cssContent.match(themeBlockRegex);

  if (!match) return false;

  return match[1].includes(`--font-${alias}`);
}

async function main() {
  const fontArg = process.argv[2];

  if (!fontArg) {
    console.log(chalk.red('❌ Please specify a font name.'));
    console.log(`Usage: ${chalk.cyan('npx add-font roboto')}`);
    return;
  }

  let alias = fontArg.toLowerCase();

  // Ask for alias with validation & conflict check
  while (true) {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'alias',
        message: `Give "${fontArg}" a nickname (e.g. "primary"):`,
        default: alias,
      },
    ]);

    alias = answer.alias.trim();

    if (!alias) {
      console.log(chalk.red('Alias cannot be empty. Please try again.'));
      continue;
    }

    if (await isAliasTaken(alias)) {
      console.log(chalk.yellow(`⚠️ Alias "${alias}" already exists. Please choose another.`));
      continue;
    }

    break; // alias is valid & unique
  }

  await modifyLayout(fontArg, alias);
  await modifyCSS(fontArg, alias);

  console.log(chalk.green(`✅ Installed "${fontArg}" as "font-${alias}"`));
}

main();
