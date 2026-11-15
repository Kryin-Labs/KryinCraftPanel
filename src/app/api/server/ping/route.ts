import { NextResponse } from 'next/server';
import net from 'net';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function encodeVarInt(value: number): Buffer {
  const bytes: number[] = [];
  while (true) {
    if ((value & ~0x7f) === 0) {
      bytes.push(value);
      return Buffer.from(bytes);
    }
    bytes.push((value & 0x7f) | 0x80);
    value >>>= 7;
  }
}

function decodeVarInt(buffer: Buffer, offset = 0): { value: number; size: number } {
  let value = 0;
  let size = 0;
  let byte: number;
  do {
    if (offset + size >= buffer.length) return { value: 0, size: 0 };
    byte = buffer[offset + size];
    value |= (byte & 0x7f) << (7 * size);
    size++;
    if (size > 5) return { value: 0, size: 0 };
  } while ((byte & 0x80) !== 0);
  return { value, size };
}

interface MinecraftPingResult {
  online: boolean;
  host: string;
  port: number;
  latency_ms: number | null;
  version?: string;
  protocol?: number;
  players?: {
    online: number;
    max: number;
    sample?: Array<{ id: string; name: string }>;
  };
  motd?: string;
  error?: string;
  checked_at: string;
}

function pingMinecraftServer(host: string, port: number, timeoutMs = 4500): Promise<MinecraftPingResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let hasResolved = false;

    const safeResolve = (result: MinecraftPingResult) => {
      if (hasResolved) return;
      hasResolved = true;
      try {
        client.destroy();
      } catch (e) {}
      resolve(result);
    };

    const timer = setTimeout(() => {
      safeResolve({
        online: false,
        host,
        port,
        latency_ms: null,
        error: `Connection timed out after ${timeoutMs}ms. Server or tunnel may be stopped.`,
        checked_at: new Date().toISOString(),
      });
    }, timeoutMs);

    const client = net.createConnection({ host, port }, () => {
      try {
        const hostBuf = Buffer.from(host, 'utf8');
        const portBuf = Buffer.alloc(2);
        portBuf.writeUInt16BE(port);

        // Minecraft Handshake Packet: ID 0x00, protocol 767, host, port, nextState 1
        const handshakePayload = Buffer.concat([
          Buffer.from([0x00]),
          encodeVarInt(767),
          encodeVarInt(hostBuf.length),
          hostBuf,
          portBuf,
          encodeVarInt(1),
        ]);

        const handshakePacket = Buffer.concat([
          encodeVarInt(handshakePayload.length),
          handshakePayload,
        ]);

        // Status request: length 1, packet ID 0
        const statusRequest = Buffer.from([0x01, 0x00]);

        client.write(Buffer.concat([handshakePacket, statusRequest]));
      } catch (err: any) {
        clearTimeout(timer);
        safeResolve({
          online: false,
          host,
          port,
          latency_ms: null,
          error: err.message || 'Handshake failed',
          checked_at: new Date().toISOString(),
        });
      }
    });

    const chunks: Buffer[] = [];

    client.on('data', (data: Buffer | string) => {
      chunks.push(Buffer.isBuffer(data) ? data : Buffer.from(data));
      const full = Buffer.concat(chunks);

      try {
        const { value: pktLen, size: pktLenSize } = decodeVarInt(full, 0);
        if (pktLenSize > 0 && full.length >= pktLen + pktLenSize) {
          clearTimeout(timer);
          const latency = Date.now() - startTime;

          const { size: idSize } = decodeVarInt(full, pktLenSize);
          const { value: strLen, size: strLenSize } = decodeVarInt(full, pktLenSize + idSize);
          const offset = pktLenSize + idSize + strLenSize;
          const jsonStr = full.slice(offset, offset + strLen).toString('utf8');

          const parsed = JSON.parse(jsonStr);

          // Extract MOTD
          let motdText = '';
          if (typeof parsed.description === 'string') {
            motdText = parsed.description;
          } else if (parsed.description && typeof parsed.description.text === 'string') {
            motdText = parsed.description.text;
          } else if (parsed.description && Array.isArray(parsed.description.extra)) {
            motdText = parsed.description.extra.map((e: any) => e.text || '').join('');
          }

          // Strip legacy Minecraft color codes for clean display
          motdText = motdText.replace(/§[0-9a-fk-or]/gi, '').trim();

          safeResolve({
            online: true,
            host,
            port,
            latency_ms: latency,
            version: parsed.version?.name || 'Minecraft Java',
            protocol: parsed.version?.protocol,
            players: {
              online: parsed.players?.online || 0,
              max: parsed.players?.max || 20,
              sample: Array.isArray(parsed.players?.sample) ? parsed.players.sample : [],
            },
            motd: motdText || 'A Minecraft Server',
            checked_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        // More chunks pending, wait for next data event
      }
    });

    client.on('error', (err) => {
      clearTimeout(timer);
      safeResolve({
        online: false,
        host,
        port,
        latency_ms: null,
        error: err.message || 'Connection refused',
        checked_at: new Date().toISOString(),
      });
    });
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let host = (searchParams.get('host') || 'scooter-stuffing.tun.ply.gg').trim();
    let port = parseInt(searchParams.get('port') || '25565', 10);

    // If host contains ":port", split it cleanly
    if (host.includes(':')) {
      const parts = host.split(':');
      host = parts[0].trim();
      const p = parseInt(parts[1], 10);
      if (!isNaN(p) && p > 0 && p <= 65535) {
        port = p;
      }
    }

    if (!host) {
      return NextResponse.json(
        { online: false, error: 'Host is required' },
        { status: 400 }
      );
    }

    if (isNaN(port) || port <= 0 || port > 65535) {
      port = 25565;
    }

    const result = await pingMinecraftServer(host, port, 4500);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      {
        online: false,
        error: err.message || 'Internal error checking Minecraft server',
        checked_at: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
