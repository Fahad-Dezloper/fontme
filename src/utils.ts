import fs from 'fs-extra';
import path from 'path';

export function pascalCase(str: string): string {
  // First, replace underscores with spaces to handle them properly
  const normalized = str.replace(/_/g, ' ');
  
  return normalized
    .split(/[-_ ]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

export async function findLayoutFile(): Promise<string | null> {
  const possiblePaths = [
    'app/layout.tsx',
    'src/app/layout.tsx',
    'app/layout.jsx',
    'src/app/layout.jsx',
  ];

  for (const p of possiblePaths) {
    if (await fs.pathExists(path.resolve(p))) {
      return path.resolve(p);
    }
  }
  return null;
}

export async function findCSSFile(): Promise<string | null> {
  const possiblePaths = [
    'app/globals.css',
    'src/app/globals.css',
    'app/global.css',
    'src/app/global.css',
    'styles/globals.css',
    'src/styles/globals.css',
    'styles/global.css',
    'src/styles/global.css',
  ];

  for (const p of possiblePaths) {
    if (await fs.pathExists(path.resolve(p))) {
      return path.resolve(p);
    }
  }
  return null;
}