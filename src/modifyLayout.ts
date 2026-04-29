import fs from 'fs-extra';
import { pascalCase, findLayoutFile } from './utils';

export async function modifyLayout(
  fontName: string,
  alias: string,
  weights: string[],
  subsets: string[]
) {
  const layoutPath = await findLayoutFile();

  if (!layoutPath) {
    throw new Error(
      '❌ layout.tsx not found (checked app/, src/app/, etc.).\n' +
      'Please make sure you are in a Next.js project directory.'
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
  const variableCode = `variable: '--font-next-${alias}'`;

  const fontOptions = `{ ${weightsCode}${subsetsCode}, ${variableCode} }`;

  // Insert font definition
  newCode = newCode.replace(
    /(^\s*)(export const metadata|export default function)/m,
    `\nconst ${fontVar} = ${FontComponent}(${fontOptions});\n$1$2`
  );

  // Update <body> className robustly
  const bodyTagRegex = /<body([^>]*)>/s;
  const bodyMatch = newCode.match(bodyTagRegex);

  if (bodyMatch) {
    const fullTag = bodyMatch[0];
    const attrs = bodyMatch[1];
    
    // Support className="...", className='...', className={...}
    const classNameRegex = /className=(?:{[`'"]?(.*?)?[`'"]?}|(["'])(.*?)\2)/;
    const classMatch = attrs.match(classNameRegex);

    if (classMatch) {
      const existingClasses = (classMatch[1] || classMatch[3] || '').trim();
      
      if (!existingClasses.includes(`${fontVar}.variable`)) {
        // If it's already a template literal, just insert the new variable at the start
        let newClassName;
        if (classMatch[1] && existingClasses.includes('${')) {
           newClassName = `className={\`\${${fontVar}.variable} ${existingClasses}\`}`;
        } else {
           newClassName = `className={\`\${${fontVar}.variable} ${existingClasses}\`}`;
        }
        
        const newAttrs = attrs.replace(classNameRegex, newClassName);
        newCode = newCode.replace(fullTag, `<body${newAttrs}>`);
      }
    } else {
      // No className present, add a new one
      const newAttrs = `${attrs.trim()} className={\`\${${fontVar}.variable} antialiased\`}`;
      newCode = newCode.replace(fullTag, `<body ${newAttrs}>`);
    }
  }

  await fs.writeFile(layoutPath, newCode, 'utf-8');
}