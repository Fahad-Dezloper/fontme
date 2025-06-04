import chalk from 'chalk';
import figlet from 'figlet';
import type { Font } from './types';

const GOOGLE_FONTS_API_KEY = process.env.GOOGLE_FONTS_API_KEY;
const API_URL = process.env.API_URL;

export async function fetchGoogleFonts(): Promise<Font[]> {
  try {
    const response = await fetch(`${API_URL}?key=${GOOGLE_FONTS_API_KEY}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Google Fonts');
    }
    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error(chalk.red('Error fetching Google Fonts:'), error);
    return [];
  }
}

export function previewFont(font: Font) {
  const fontName = font.family;
  
  // preview here
  console.log('\n' + chalk.cyan('Font Preview:'));
  console.log(chalk.cyan('─'.repeat(50)));
  
  // figlet preview
  console.log(
    figlet.textSync(fontName, {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default',
    })
  );
  
  // available weights
  const normalWeights = font.variants.filter(variant => !variant.includes('italic'));
  console.log(chalk.cyan('Available Weights:'));
  console.log(normalWeights.join(', '));
  console.log(chalk.cyan('─'.repeat(50)) + '\n');
}

export function searchFonts(fonts: Font[], query: string): Font[] {
  const searchTerm = query.toLowerCase();
  return fonts.filter(font => 
    font.family.toLowerCase().includes(searchTerm)
  );
} 