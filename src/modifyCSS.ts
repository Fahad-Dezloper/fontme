import fs from 'fs-extra';
import path from 'path';

export async function modifyCSS(fontName: string, alias: string) {
  const cssPath = path.resolve('app/globals.css');

  if (!(await fs.pathExists(cssPath))) {
    throw new Error('❌ app/globals.css not found');
  }

  const cssContent = await fs.readFile(cssPath, 'utf-8');

  const varName = `--font-${alias}`;
  const varValue = `'${fontName}', sans-serif;`;
  const newVariableLine = `  ${varName}: ${varValue}`;

  const themeBlockRegex = /@theme\s*{([\s\S]*?)}/m;

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
    const themeBlock = `\n@theme {\n${newVariableLine}\n}\n`;

    await fs.appendFile(cssPath, themeBlock, 'utf-8');
    console.log(`✅ Created new @theme block with ${varName}.`);
  }
}
