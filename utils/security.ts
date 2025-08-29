export function sanitizeForLog(input: any): string {
  if (typeof input === 'string') {
    return input.replace(/[<>]/g, '');
  }
  if (input instanceof Error) {
    return input.message.replace(/[<>]/g, '');
  }
  return String(input).replace(/[<>]/g, '');
}

export function sanitizeHtml(input: string): string {
  return input.replace(/[<>&"']/g, (match) => {
    const map: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#x27;'
    };
    return map[match];
  });
}

export function sanitizeInt(input: string | null, defaultValue: number = 0): number {
  if (!input) return defaultValue;
  const parsed = parseInt(input, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}