export function pascalCase(str: string): string {
    return str
      .split(/[-_ ]+/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');
  }
  