export const serverPropertyFields = [
  { key: 'motd', label: 'Message of the day (MOTD)', kind: 'text' },
  { key: 'max-players', label: 'Max players', kind: 'number', min: 1, max: 10000 },
  { key: 'view-distance', label: 'View distance', kind: 'number', min: 2, max: 32 },
  { key: 'simulation-distance', label: 'Simulation distance', kind: 'number', min: 2, max: 32 },
  { key: 'difficulty', label: 'Difficulty', kind: 'select', options: ['peaceful', 'easy', 'normal', 'hard'] },
  { key: 'pvp', label: 'Player versus player', kind: 'boolean' },
  { key: 'white-list', label: 'Whitelist', kind: 'boolean' },
] as const;

export type ServerPropertyKey = typeof serverPropertyFields[number]['key'];
export type ServerProperties = Partial<Record<ServerPropertyKey, string>>;

function decodeProperty(value: string) {
  return value.replace(/\\(u[\da-fA-F]{4}|.)/g, (_, escaped: string) => {
    if (escaped.length === 5 && escaped[0] === 'u') return String.fromCharCode(Number.parseInt(escaped.slice(1), 16));
    return ({ t: '\t', r: '\r', n: '\n', f: '\f' } as Record<string, string>)[escaped] ?? escaped;
  });
}

export function parseServerProperties(text: string): ServerProperties {
  const properties: ServerProperties = {};
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([a-z-]+)(?:\s*[:=]\s*|\s+)(.*)$/);
    if (!match) continue;
    const field = serverPropertyFields.find(({ key }) => key === match[1]);
    if (field) properties[field.key] = decodeProperty(match[2]);
  }
  return properties;
}

export function validateServerProperties(input: unknown): ServerProperties | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const result: ServerProperties = {};
  for (const [key, value] of Object.entries(input)) {
    const field = serverPropertyFields.find((entry) => entry.key === key);
    if (!field || typeof value !== 'string') return null;
    if (field.kind === 'text' && (value.length > 512 || /[\u0000-\u0009\u000b-\u001f]/.test(value) || value.split('\n').length > 2)) return null;
    if (field.kind === 'number' && (!/^\d+$/.test(value) || Number(value) < field.min || Number(value) > field.max)) return null;
    if (field.kind === 'select' && !field.options.some((option) => option === value)) return null;
    if (field.kind === 'boolean' && value !== 'true' && value !== 'false') return null;
    result[field.key] = value;
  }
  return Object.keys(result).length ? result : null;
}

export function encodeProperty(value: string) {
  return value.replace(/^[ ]+|\\|[^\x20-\x7e]/g, (part) => {
    if (part[0] === ' ') return '\\ '.repeat(part.length);
    if (part === '\\') return '\\\\';
    return '\\u' + part.charCodeAt(0).toString(16).padStart(4, '0');
  });
}
