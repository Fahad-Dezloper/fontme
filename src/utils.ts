export function pascalCase(str: string): string {
  // First, replace underscores with spaces to handle them properly
  const normalized = str.replace(/_/g, ' ');
  
  return normalized
    .split(/[-_ ]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}
  