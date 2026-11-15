/**
 * Converts Minecraft section-sign formatting codes (§a, §c, etc.) 
 * and formats uncolored log lines into vivid ANSI escape sequences for xterm.js
 */

const MINECRAFT_ANSI_MAP: Record<string, string> = {
  '0': '\u001b[30m', // Black
  '1': '\u001b[34m', // Dark Blue
  '2': '\u001b[32m', // Dark Green
  '3': '\u001b[36m', // Dark Aqua
  '4': '\u001b[31m', // Dark Red
  '5': '\u001b[35m', // Dark Purple
  '6': '\u001b[33m', // Gold
  '7': '\u001b[37m', // Gray
  '8': '\u001b[90m', // Dark Gray
  '9': '\u001b[94m', // Blue
  'a': '\u001b[92m', // Bright Green
  'b': '\u001b[96m', // Bright Cyan / Aqua
  'c': '\u001b[91m', // Bright Red
  'd': '\u001b[95m', // Bright Magenta / Pink
  'e': '\u001b[93m', // Bright Yellow
  'f': '\u001b[97m', // Bright White
  'l': '\u001b[1m',  // Bold
  'o': '\u001b[3m',  // Italic
  'n': '\u001b[4m',  // Underline
  'm': '\u001b[9m',  // Strikethrough
  'k': '\u001b[5m',  // Obfuscated
  'r': '\u001b[0m',  // Reset
};

export function formatMinecraftLog(raw: string): string {
  if (!raw) return '';

  // 1. Replace Minecraft section sign color codes (§0 - §r)
  let formatted = raw.replace(/§([0-9a-fklmnor])/gi, (_, code) => {
    const lower = code.toLowerCase();
    return MINECRAFT_ANSI_MAP[lower] || '';
  });

  // 2. If line already contains ANSI escape codes, ensure it ends with reset and return
  if (formatted.includes('\u001b[')) {
    return formatted.endsWith('\u001b[0m') ? formatted : `${formatted}\u001b[0m`;
  }

  // 3. Highlight uncolored Minecraft server log headers
  // e.g. [19:42:01 INFO]: Server loaded... or [19:42:01 WARN]: ... or [19:42:01 ERROR]: ...
  formatted = formatted.replace(
    /^(\[?[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]{3})?\]?)\s*(?:\[([^\]]+)\])?\s*(.*)$/,
    (match, ts, tag, rest) => {
      let styledTag = '';
      if (tag) {
        const upperTag = tag.toUpperCase();
        if (upperTag.includes('ERROR') || upperTag.includes('FATAL') || upperTag.includes('SEVERE')) {
          styledTag = `\u001b[41;97;1m ${tag} \u001b[0m`;
        } else if (upperTag.includes('WARN')) {
          styledTag = `\u001b[43;30;1m ${tag} \u001b[0m`;
        } else if (upperTag.includes('INFO')) {
          styledTag = `\u001b[32;1m[${tag}]\u001b[0m`;
        } else {
          styledTag = `\u001b[36m[${tag}]\u001b[0m`;
        }
      }

      let styledRest = rest || '';
      if (styledRest.includes('WARN') || styledRest.includes('Warning')) {
        styledRest = `\u001b[33m${styledRest}\u001b[0m`;
      } else if (styledRest.includes('ERROR') || styledRest.includes('Exception') || styledRest.includes('Error')) {
        styledRest = `\u001b[91m${styledRest}\u001b[0m`;
      }

      const styledTs = `\u001b[90m${ts}\u001b[0m`;
      return `${styledTs} ${styledTag} ${styledRest}`.trim();
    }
  );

  // Command prompt echo styling: e.g. "> tps" or "> /list"
  if (formatted.startsWith('&gt; ') || formatted.startsWith('> ')) {
    return `\u001b[36;1m${formatted}\u001b[0m`;
  }

  return `${formatted}\u001b[0m`;
}
