import fs from 'fs-extra';
import { findCSSFile } from './utils';

export async function modifyCSS(fontName: string, alias: string) {
  const cssPath = await findCSSFile();

  if (!cssPath) {
    throw new Error('❌ globals.css not found (checked app/, src/app/, styles/, src/styles/)');
  }

  const cssContent = await fs.readFile(cssPath, 'utf-8');

  const varName = `--font-${alias}`;
  const varValue = `var(--font-next-${alias});`;
  const newVariableLine = `  ${varName}: ${varValue}`;

  const themeBlockRegex = /@theme(?:\s+[\w-]+)?\s*{([\s\S]*?)}/m;

  if (themeBlockRegex.test(cssContent)) {
    const currentThemeContent = cssContent.match(themeBlockRegex)![1];

    if (currentThemeContent.includes(varName)) {
      console.log(`⚠️ Variable ${varName} already exists in @theme, skipping.`);
      return;
    }

    const updatedThemeContent = currentThemeContent.trimEnd() + `\n${newVariableLine}\n`;

    const updatedCss = cssContent.replace(
      themeBlockRegex,
      `@theme {\n${updatedThemeContent}}`
    );

    await fs.writeFile(cssPath, updatedCss, 'utf-8');
    console.log(`✅ Added ${varName} to existing @theme block.`);
  } else {
    const themeBlock = `\n@theme inline {\n${newVariableLine}\n}\n`;
    
    await fs.appendFile(cssPath, themeBlock, 'utf-8');
    console.log(`✅ Created new @theme inline block with ${varName}.`);
  }
}
