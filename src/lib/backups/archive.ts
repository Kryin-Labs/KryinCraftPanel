import 'server-only';
import { crc32, deflateRawSync } from 'node:zlib';

const rootFiles = ['server.properties', 'bukkit.yml', 'spigot.yml', 'paper.yml', 'purpur.yml',
  'pufferfish.yml', 'commands.yml', 'permissions.yml'];
const configFiles = ['config/paper-global.yml', 'config/paper-world-defaults.yml'];
const properties = [
  'accepts-transfers', 'allow-flight', 'allow-nether', 'broadcast-console-to-ops', 'broadcast-rcon-to-ops',
  'bug-report-link', 'difficulty', 'enable-command-block', 'enable-jmx-monitoring',
  'enable-query', 'enable-rcon', 'enable-status', 'enforce-secure-profile', 'enforce-whitelist',
  'entity-broadcast-range-percentage', 'force-gamemode', 'function-permission-level', 'gamemode',
  'generate-structures', 'generator-settings', 'hardcore', 'hide-online-players', 'initial-disabled-packs',
  'initial-enabled-packs', 'level-name', 'level-seed', 'level-type', 'log-ips', 'max-chained-neighbor-updates',
  'max-players', 'max-tick-time', 'max-world-size', 'motd', 'network-compression-threshold', 'online-mode',
  'op-permission-level', 'pause-when-empty-seconds', 'player-idle-timeout', 'prevent-proxy-connections',
  'pvp', 'query.port', 'rate-limit', 'region-file-compression', 'require-resource-pack',
  'resource-pack-id', 'resource-pack-sha1', 'rcon.port', 'server-port', 'simulation-distance',
  'spawn-animals', 'spawn-monsters', 'spawn-npcs', 'spawn-protection', 'sync-chunk-writes',
  'text-filtering-version', 'use-native-transport', 'view-distance', 'white-list',
];
const pluginPath = '^plugins/[A-Za-z0-9_-](?:[A-Za-z0-9_. -]{0,78}[A-Za-z0-9_-])?/(?:config|settings|messages|lang|locale|language)\x5c.(?:yml|yaml|toml|json|conf|properties)$';
const sensitive = String.raw`password|passwd|passphrase|\b(?:pass|pwd)\s*[:=]|token|secret|credential|api[_. -]*key|access[_. -]*key|private[_. -]*key|client[_. -]*key|authorization|webhook|connection[_. -]*string|database[_. -]*url|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:https?|jdbc|mysql|postgres(?:ql)?|mongodb(?:\+srv)?|redis|ftp|sftp)://[^\s"']+(?:@|[?&])`;

export const backupPolicy = {
  rootFiles, configFiles, pluginPath, properties, sensitive,
  fileMax: 128 * 1024,
  totalMax: 768 * 1024,
  maxFiles: 72,
};
const pluginPattern = new RegExp(pluginPath, 'i');
const secretPattern = new RegExp(sensitive, 'i');
const propertyNames = new Set(properties);
const allowedPaths = new Set([...rootFiles, ...configFiles]);

function filteredProperties(text: string) {
  const lines: string[] = [];
  let continuing = false;
  for (const line of text.split(/\r?\n/)) {
    const key = /^\s*([a-z\d.-]+)(?:\s*[=:]|\s+)/.exec(line)?.[1];
    const continues = (line.match(/\\+$/)?.[0].length ?? 0) % 2 !== 0;
    if (!continuing && !continues && key && propertyNames.has(key) && !secretPattern.test(line)) {
      lines.push(line);
    }
    continuing = continues;
  }
  return lines.join('\n') + '\n';
}
export function prepareBackup(files: unknown, deviceOmitted: unknown) {
  if (!Array.isArray(files) || files.length > backupPolicy.maxFiles) return null;
  let omitted = typeof deviceOmitted === 'number' && Number.isSafeInteger(deviceOmitted)
    ? Math.max(0, Math.min(deviceOmitted, 9999)) : 0;
  let total = 0;
  const contents = new Map<string, string>();
  const names = new Set<string>();
  for (const candidate of files) {
    if (!candidate || typeof candidate.path !== 'string' || typeof candidate.content !== 'string') return null;
    const { path, content } = candidate as { path: string; content: string };
    if ((!allowedPaths.has(path) && !pluginPattern.test(path)) ||
      names.has(path.toLowerCase())) return null;
    const text = path === 'server.properties' ? filteredProperties(content) : content;
    const size = Buffer.byteLength(text);
    if (!text.trim() || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(text) || size > backupPolicy.fileMax ||
      total + size > backupPolicy.totalMax || secretPattern.test(text)) {
      omitted++;
      continue;
    }
    names.add(path.toLowerCase());
    total += size;
    contents.set(path, text);
  }
  if (!contents.size) return null;
  const count = contents.size;
  contents.set('BACKUP-INFO.txt', [
    'KryinCraft configuration backup',
    'Created: ' + new Date().toISOString(),
    'Configuration files included: ' + count,
    'Files skipped during collection: ' + omitted,
    'server.properties contains allowlisted settings. Keep your live credentials when replacing settings.',
    'Credential-like plugin configs are skipped. Review these files before sharing them.',
    '',
  ].join('\n'));
  return { archive: packZip(contents), count, omitted };
}

function packZip(files: Map<string, string>) {
  const blocks: Buffer[] = [];
  const directory: Buffer[] = [];
  let offset = 0;
  let directoryBytes = 0;

  for (const [path, content] of files) {
    const filename = Buffer.from(path);
    const bytes = Buffer.from(content);
    const compressed = deflateRawSync(bytes);
    const checksum = crc32(bytes);

    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0x800, 6);
    header.writeUInt16LE(8, 8);
    header.writeUInt16LE(33, 12);
    header.writeUInt32LE(checksum, 14);
    header.writeUInt32LE(compressed.length, 18);
    header.writeUInt32LE(bytes.length, 22);
    header.writeUInt16LE(filename.length, 26);
    blocks.push(header, filename, compressed);

    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4);
    header.copy(entry, 6, 4, 30);
    entry.writeUInt32LE(offset, 42);
    directory.push(entry, filename);
    directoryBytes += entry.length + filename.length;
    offset += header.length + filename.length + compressed.length;
  }

  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.size, 8);
  end.writeUInt16LE(files.size, 10);
  end.writeUInt32LE(directoryBytes, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...blocks, ...directory, end]);
}
