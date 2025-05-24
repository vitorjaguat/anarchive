export function truncate(str: string, maxLength: number): string {
  // Truncate a string to a maximum length and add ellipsis if truncated
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
}
