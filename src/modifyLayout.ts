import fs from 'fs-extra';
import path from 'path';
import { pascalCase } from './utils';

export async function modifyLayout(fontName: string, alias: string) {
  const layoutPath = path.resolve('app/layout.tsx');

  if (!await fs.pathExists(layoutPath)) {
    throw new Error('app/layout.tsx not found');
  }

  const layoutCode = await fs.readFile(layoutPath, 'utf-8');
  const FontComponent = pascalCase(fontName); // e.g., roboto → Roboto
  const fontVar = fontName.toLowerCase();     // roboto

  // Prevent duplicates
  if (layoutCode.includes(`const ${fontVar} = ${FontComponent}`)) {
    console.log(`⚠️ Font "${fontName}" already seems to be added.`);
    return;
  }

  let newCode = layoutCode;

  // Add import for font
  newCode = newCode.replace(
    /(^import .*?;)/m,
    `$1\nimport { ${FontComponent} } from 'next/font/google';`
  );

  // Add font const declaration
  newCode = newCode.replace(
    /(^\s*)(export const metadata|export default function)/m,
    `\nconst ${fontVar} = ${FontComponent}({ subsets: ['latin'], variable: '--font-${alias}' });\n$1$2`
  );

  const bodyClassRegex = /<body([^>]*)className={(["'`]?)(.*?)\2}([^>]*)>/s;

  if (bodyClassRegex.test(newCode)) {
    // Merge with existing className
    newCode = newCode.replace(
      bodyClassRegex,
      (_, beforeAttrs, quote, existingClasses, after) => {
        const classes = existingClasses.trim();
        const insertion = `\${${fontVar}.variable} ${classes}`;
        return `<body${beforeAttrs}className={\`${insertion}\`}${after}>`;
      }
    );
  } else {
    // No className present, add a new one
    newCode = newCode.replace(
      /<body([^>]*)>/,
      `<body$1 className={\`\${${fontVar}.variable} antialiased\`}>`
    );
  }
  


  await fs.writeFile(layoutPath, newCode, 'utf-8');
}
