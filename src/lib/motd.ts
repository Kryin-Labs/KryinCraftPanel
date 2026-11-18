export const motdColors = [
  ['0','#000000'],['1','#0000aa'],['2','#00aa00'],['3','#00aaaa'],
  ['4','#aa0000'],['5','#aa00aa'],['6','#ffaa00'],['7','#aaaaaa'],
  ['8','#555555'],['9','#5555ff'],['a','#55ff55'],['b','#55ffff'],
  ['c','#ff5555'],['d','#ff55ff'],['e','#ffff55'],['f','#ffffff'],
] as const;

const colors = new Map<string, string>(motdColors);

export function normalizeMotd(text: string) {
  return text.replace(/&#([\da-f]{6})/gi, (_, hex: string) => '§x' + hex.split('').map((digit) => '§' + digit).join(''))
    .replace(/&([0-9a-fk-orx])/gi, '§$1');
}

export function motdRuns(value: string) {
  const pieces = normalizeMotd(value).split(/(§x(?:§[\da-f]){6}|§[0-9a-fk-or])/gi);
  let color = '#aaaaaa';
  let formats = new Set<string>();
  const runs = [];
  for (let index = 0; index < pieces.length; index++) {
    const part = pieces[index];
    if (!part) continue;
    if (index % 2 === 0) {
      runs.push({ text: part, color, bold: formats.has('l'), italic: formats.has('o'),
        underline: formats.has('n'), strike: formats.has('m'), obfuscated: formats.has('k') });
      continue;
    }
    const code = part[1].toLowerCase();
    if (code === 'x' || code === 'r' || colors.has(code)) {
      color = code === 'x' ? '#' + part.slice(2).replaceAll('§', '') : colors.get(code) ?? '#aaaaaa';
      formats = new Set();
    } else {
      formats.add(code);
    }
  }
  return runs;
}
