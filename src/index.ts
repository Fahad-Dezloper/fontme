import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { modifyLayout } from "./modifyLayout";
import { modifyCSS } from "./modifyCSS";
import { fetchGoogleFonts, previewFont, searchFonts } from "./googleFonts";
import inquirerPrompt from "inquirer-autocomplete-prompt";
import type { Font } from "./types";

inquirer.registerPrompt('autocomplete', inquirerPrompt);

const FONT_WEIGHTS = [
  "100", "200", "300", "400", "500", "600", "700", "800", "900",
  "normal", "bold"
];

const FONT_SUBSETS = [
  {
    value: "latin",
    name: "Latin (English, French, Spanish, German, etc.)",
    checked: true
  },
  {
    value: "latin-ext",
    name: "Latin Extended (Polish, Czech, Hungarian, etc.)"
  },
  {
    value: "cyrillic",
    name: "Cyrillic (Russian, Bulgarian, Serbian, etc.)"
  },
  {
    value: "cyrillic-ext",
    name: "Cyrillic Extended (Ukrainian, Belarusian, etc.)"
  },
  {
    value: "greek",
    name: "Greek (Modern Greek)"
  },
  {
    value: "greek-ext",
    name: "Greek Extended (Ancient Greek, Coptic)"
  },
  {
    value: "vietnamese",
    name: "Vietnamese"
  },
  {
    value: "devanagari",
    name: "Devanagari (Hindi, Sanskrit, etc.)"
  }
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
  try {
    console.log(chalk.cyan('Fetching Google Fonts...'));
    const fonts = await fetchGoogleFonts();
    
    if (fonts.length === 0) {
      throw new Error('Failed to fetch Google Fonts. Please check your internet connection.');
    }

    let selectedFont: Font | null = null;
    let confirmed = false;

    while (!confirmed) {
      const { selectedFont: font } = await inquirer.prompt<{ selectedFont: Font }>([
        {
          type: "autocomplete" as const,
          name: "selectedFont",
          message: "Search for a Google Font:",
          source: (_answersSoFar: any, input: string) => {
            const results = searchFonts(fonts, input || '');
            return results.map(font => ({
              name: font.family,
              value: font
            }));
          },
          pageSize: 10,
          validate: (input: any) => input ? true : 'Please select a font'
        }
      ]);

      previewFont(font);

      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: `Do you want to use "${font.family}"?`,
          default: true
        }
      ]);

      if (confirm) {
        selectedFont = font;
        confirmed = true;
      } else {
        console.log(chalk.yellow('Let\'s try another font...\n'));
      }
    }

    if (!selectedFont) {
      throw new Error('No font was selected');
    }

    let alias = selectedFont.family.toLowerCase();

    while (true) {
      const answer = await inquirer.prompt([
        {
          type: "input",
          name: "alias",
          message: `Give "${selectedFont.family}" a nickname (e.g. "primary"):`,
          default: alias,
        },
      ]);

      alias = answer.alias.trim().toLowerCase().replace(/\s+/g, '-');

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

    const availableWeights = FONT_WEIGHTS.filter(weight => 
      selectedFont.variants.includes(weight) && !weight.includes('italic')
    );

    const defaultWeight = availableWeights.includes('400') ? '400' : 'regular';

    const { weights, subsets } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "weights",
        message: "Select font weights (space to select):",
        choices: availableWeights.length > 0 ? availableWeights : ['regular'],
        default: [defaultWeight],
        validate: input => input.length > 0 ? true : "Select at least one weight",
      },
      {
        type: "checkbox",
        name: "subsets",
        message: "Choose language support (for faster load times):\n" + 
                 chalk.gray("We'll only include the characters you need."),
        choices: FONT_SUBSETS.filter(subset => 
          selectedFont.subsets.includes(subset.value)
        ),
        default: ["latin"],
        validate: input => input.length > 0 ? true : "Select at least one language support",
      },
    ]);

    await modifyLayout(selectedFont.family, alias, weights, subsets);
    await modifyCSS(selectedFont.family, alias);

    console.log(chalk.green(`✅ Installed "${selectedFont.family}" as "font-${alias}"`));
  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : 'An unexpected error occurred');
    process.exit(1);
  }
}

main();