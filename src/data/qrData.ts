export function publicBaseUrl(input: string): string | null {
  try {
    const url = new URL(input.trim());
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    // Activities are served at the root. Pasted activity URLs must not duplicate paths.
    return url.origin;
  } catch { return null; }
}
