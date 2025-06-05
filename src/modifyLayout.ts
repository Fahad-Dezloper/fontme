import fs from 'fs-extra';
import path from 'path';
import { pascalCase } from './utils';

export async function modifyLayout(
  fontName: string,
  alias: string,
  weights: string[],
  subsets: string[]
) {
  const layoutPath = path.resolve('app/layout.tsx');
  const appDirPath = path.resolve('app');

  // Check if this is a Next.js project
  if (!await fs.pathExists(appDirPath)) {
    throw new Error(
      '❌ This does not appear to be a Next.js project.\n' +
      'Please run this command in a Next.js project directory with an "app" folder.'
    );
  }

  // Check for layout file
  if (!await fs.pathExists(layoutPath)) {
    throw new Error(
      '❌ app/layout.tsx not found.\n' +
      'Please make sure you have a layout file at app/layout.tsx in your Next.js project.'
    );
  }

  const layoutCode = await fs.readFile(layoutPath, 'utf-8');
  
  // Convert font name to match Google Fonts export name
  // e.g., "Cabin Sketch" -> "Cabin_Sketch"
  const FontComponent = fontName.replace(/\s+/g, '_');
  const fontVar = fontName.toLowerCase().replace(/\s+/g, ''); // e.g., "Cabin Sketch" -> "cabinsketch"

  // Prevent duplicates
  if (layoutCode.includes(`const ${fontVar} = ${FontComponent}`)) {
    console.log(`⚠️ Font "${fontName}" already seems to be added.`);
    return;
  }

  let newCode = layoutCode;

  // Add import
  newCode = newCode.replace(
    /(^import .*?;)/m,
    `$1\nimport { ${FontComponent} } from 'next/font/google';`
  );

  // Prepare font options
  const subsetsCode = `subsets: [${subsets.map(s => `'${s}'`).join(', ')}]`;
  
  // Convert 'regular' to '400' for the weight option
  const processedWeights = weights.map(w => w === 'regular' ? '400' : w);
  const weightsCode = processedWeights.length > 0 ? `weight: [${processedWeights.map(w => `'${w}'`).join(', ')}], ` : '';
  const variableCode = `variable: '--font-${alias}'`;

  const fontOptions = `{ ${weightsCode}${subsetsCode}, ${variableCode} }`;

  // Insert font definition
  newCode = newCode.replace(
    /(^\s*)(export const metadata|export default function)/m,
    `\nconst ${fontVar} = ${FontComponent}(${fontOptions});\n$1$2`
  );

  // Update <body> className
  const bodyClassRegex = /<body([^>]*)className={(["'`]?)(.*?)\2}([^>]*)>/s;

  if (bodyClassRegex.test(newCode)) {
    newCode = newCode.replace(
      bodyClassRegex,
      (_, beforeAttrs, quote, existingClasses, after) => {
        const classes = existingClasses.trim();
        const insertion = `\${${fontVar}.variable} ${classes}`;
        return `<body${beforeAttrs}className={\`${insertion}\`}${after}>`;
      }
    );
  } else {
    newCode = newCode.replace(
      /<body([^>]*)>/,
      `<body$1 className={\`\${${fontVar}.variable} antialiased\`}>`
    );
  }

  await fs.writeFile(layoutPath, newCode, 'utf-8');
}