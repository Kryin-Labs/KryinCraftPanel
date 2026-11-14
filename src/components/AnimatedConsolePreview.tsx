'use client';

import React, { useState, useEffect, useRef } from 'react';

interface LogLine {
  id: string;
  text: string;
  color: 'green' | 'yellow' | 'purple' | 'blue' | 'red' | 'muted' | 'white';
}

const TABS = [
  { name: 'paper', label: 'paper' },
  { name: 'world', label: 'world' },
  { name: 'players', label: 'players' },
  { name: 'network', label: 'network' },
  { name: 'plugins', label: 'plugins' },
];

const COLOR_MAP: Record<LogLine['color'], string> = {
  green: '#bce784',
  yellow: '#fcfbc3',
  purple: '#c59fff',
  blue: '#8dbdff',
  red: '#e58d8d',
  muted: '#a5a7ad',
  white: '#e5e6e9',
};

const LIVE_EVENTS: [string, LogLine['color']][] = [
  ['[Server] Steve moved too quickly!', 'yellow'],
  ['[World] Autosaving world...', 'white'],
  ['[World] Saved the world successfully', 'green'],
  ['[Server] Alex issued server command: /spawn', 'blue'],
  ['[Server] <Steve> Anyone online?', 'purple'],
  ['[Server] <Alex> Welcome everyone!', 'purple'],
  ['[Server] Notch joined the game', 'green'],
  ['[Network] Connection established successfully', 'blue'],
  ['[Server] Builder issued server command: /home', 'blue'],
  ['[World] Autosave completed', 'green'],
  ['[Server] Steve has made the advancement [Stone Age]', 'yellow'],
  ['[Server] <Notch> Nice server!', 'purple'],
  ['[Server] Alex left the game', 'yellow'],
  ['[Server] There are 12/100 players online', 'blue'],
  ['[Server] Saving player data...', 'white'],
  ['[Server] All chunks are saved', 'green'],
  ['[Network] Ping response: 24ms', 'blue'],
  ['[Server] <Builder> Building something cool!', 'purple'],
  ['[World] Chunk generation completed', 'green'],
  ['[Server] Steve earned the advancement [Getting an Upgrade]', 'yellow'],
];

export default function AnimatedConsolePreview() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [lines, setLines] = useState<LogLine[]>([]);
  const [playerCount, setPlayerCount] = useState<number>(12);
  const [serverStats, setServerStats] = useState<string>('TPS 20.0   RAM 2.4 GB / 6 GB');
  const [uptime, setUptime] = useState<string>('UPTIME 00:00:00');
  const [inputValue, setInputValue] = useState<string>('');

  const outputRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef<boolean>(true);

  // Auto-scroll output container
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  // Main console animation sequence
  useEffect(() => {
    isMountedRef.current = true;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const timeout = setTimeout(resolve, ms);
        if (!isMountedRef.current) clearTimeout(timeout);
      });

    const addLine = (text: string, color: LogLine['color'] = 'white') => {
      if (!isMountedRef.current) return;
      setLines((prev) => [
        ...prev,
        { id: `${Date.now()}-${Math.random()}`, text, color },
      ]);
    };

    const typeLine = async (text: string, color: LogLine['color'] = 'white', speed = 20) => {
      if (!isMountedRef.current) return;
      const lineId = `${Date.now()}-${Math.random()}`;

      // Insert empty line first
      setLines((prev) => [...prev, { id: lineId, text: '', color }]);

      for (let i = 0; i < text.length; i++) {
        if (!isMountedRef.current) return;
        const char = text[i];
        setLines((prev) =>
          prev.map((l) => (l.id === lineId ? { ...l, text: l.text + char } : l))
        );
        await sleep(speed);
      }
    };

    // Live Uptime Timer
    let totalSeconds = 0;
    const uptimeInterval = setInterval(() => {
      if (!isMountedRef.current) return;
      totalSeconds++;
      const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
      const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
      const s = String(totalSeconds % 60).padStart(2, '0');
      setUptime(`UPTIME ${h}:${m}:${s}`);
    }, 1000);

    const runSequence = async () => {
      setLines([]);
      setActiveTab(0);
      setPlayerCount(12);

      // 1. SERVER STARTUP
      await typeLine('[Server] Initializing Minecraft server...', 'purple', 22);
      await sleep(400);

      addLine('[Server] Java 21 detected', 'green');
      await sleep(350);

      addLine('[Server] Loading server.properties', 'white');
      await sleep(350);

      addLine('[Server] Loading libraries and dependencies...', 'white');
      await sleep(500);

      addLine('[Server] Starting Paper server version 1.21.4', 'blue');
      await sleep(500);

      addLine('[Server] Preparing level "world"', 'white');
      await sleep(350);

      // 2. WORLD
      if (!isMountedRef.current) return;
      setActiveTab(1);

      await typeLine('[World] Loading world data...', 'yellow', 18);
      await sleep(400);

      addLine('[World] Loading spawn chunks: 25%', 'white');
      await sleep(350);

      addLine('[World] Loading spawn chunks: 64%', 'white');
      await sleep(350);

      addLine('[World] Loading spawn chunks: 100%', 'green');
      await sleep(350);

      addLine('[World] Preparing spawn area: 100%', 'green');
      await sleep(400);

      addLine('[World] Loaded 1248 chunks', 'white');
      await sleep(400);

      // 3. PLUGINS
      if (!isMountedRef.current) return;
      setActiveTab(4);

      await typeLine('[Plugins] Loading server plugins...', 'purple', 18);
      await sleep(350);

      addLine('[Plugins] EssentialsX enabled', 'green');
      await sleep(250);

      addLine('[Plugins] LuckPerms enabled', 'green');
      await sleep(250);

      addLine('[Plugins] WorldEdit enabled', 'green');
      await sleep(250);

      addLine('[Plugins] PlaceholderAPI enabled', 'green');
      await sleep(350);

      addLine('[Plugins] Successfully loaded 14 plugins', 'green');
      await sleep(400);

      // 4. NETWORK
      if (!isMountedRef.current) return;
      setActiveTab(3);

      await typeLine('[Network] Binding server to 0.0.0.0:25565', 'blue', 18);
      await sleep(350);

      addLine('[Network] Server socket opened', 'green');
      await sleep(350);

      addLine('[Network] Query listener started', 'white');
      await sleep(350);

      addLine('[Server] Done! For help, type "help"', 'green');
      await sleep(600);

      // 5. PLAYER ACTIVITY
      if (!isMountedRef.current) return;
      setActiveTab(2);

      addLine('', 'white');
      await typeLine('[Players] Monitoring player connections...', 'purple', 18);
      await sleep(500);

      addLine('[Server] Steve joined the game', 'green');
      await sleep(350);

      addLine('[Server] Alex joined the game', 'green');
      await sleep(350);

      addLine('[Server] Notch joined the game', 'green');
      await sleep(350);

      addLine('[Server] Builder joined the game', 'green');
      await sleep(350);

      addLine('[Server] There are 12/100 players online', 'blue');
      await sleep(700);

      // 6. LIVE SERVER ACTIVITY LOOP
      if (!isMountedRef.current) return;
      await typeLine('[Console] Server is now running normally.', 'green', 20);

      let eventIndex = 0;
      let currPlayers = 12;

      while (isMountedRef.current) {
        await sleep(1000 + Math.random() * 1200);
        if (!isMountedRef.current) break;

        const event = LIVE_EVENTS[eventIndex];
        addLine(event[0], event[1]);

        eventIndex = (eventIndex + 1) % LIVE_EVENTS.length;

        // Fluctuating players
        if (Math.random() > 0.7) {
          currPlayers += Math.random() > 0.5 ? 1 : -1;
          currPlayers = Math.max(5, Math.min(25, currPlayers));
          setPlayerCount(currPlayers);
        }

        // Fluctuating stats
        const tps = (19.8 + Math.random() * 0.2).toFixed(1);
        const ram = (2.2 + Math.random() * 0.6).toFixed(1);
        setServerStats(`TPS ${tps}   RAM ${ram} GB / 6 GB`);
      }
    };

    runSequence();

    return () => {
      isMountedRef.current = false;
      clearInterval(uptimeInterval);
    };
  }, []);

  // Handle command submission
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const cmd = inputValue.trim();
    setLines((prev) => [
      ...prev,
      { id: `${Date.now()}`, text: `> ${cmd}`, color: 'yellow' },
    ]);

    if (cmd.toLowerCase() === 'help') {
      setTimeout(() => {
        setLines((prev) => [
          ...prev,
          { id: `${Date.now()}-1`, text: '--- Showing help page 1 of 5 ---', color: 'blue' },
          { id: `${Date.now()}-2`, text: '/gamemode <mode> [player] - Set player gamemode', color: 'white' },
          { id: `${Date.now()}-3`, text: '/op <player> - Grant operator status', color: 'white' },
          { id: `${Date.now()}-4`, text: '/tps - Display current engine tick rate', color: 'white' },
        ]);
      }, 200);
    } else if (cmd.toLowerCase() === 'tps') {
      setTimeout(() => {
        setLines((prev) => [
          ...prev,
          { id: `${Date.now()}-tps`, text: 'TPS from last 1m, 5m, 15m: 20.0, 20.0, 20.0 (MSPT: 11.2ms)', color: 'green' },
        ]);
      }, 200);
    } else {
      setTimeout(() => {
        setLines((prev) => [
          ...prev,
          { id: `${Date.now()}-res`, text: `[Server] Command executed: ${cmd}`, color: 'green' },
        ]);
      }, 250);
    }

    setInputValue('');
  };

  return (
    <div className="warp-live-console-wrapper w-full flex justify-center py-4">
      <style>{`
        .warp-mc-terminal {
          width: 100%;
          max-width: 1250px;
          aspect-ratio: 1.62 / 1;
          min-height: 480px;
          max-height: 780px;
          background: #1e2122;
          border-radius: 13px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0,0,0,.22);
          display: flex;
          flex-direction: column;
          color: #d8d9de;
          font-family: Consolas, ui-monospace, monospace;
        }

        .warp-mc-topbar {
          height: 42px;
          min-height: 42px;
          background: #443c52;
          display: flex;
          align-items: center;
          padding: 0 25px;
          gap: 30px;
          white-space: nowrap;
          overflow: hidden;
          font-size: clamp(11px, 1.5vw, 17px);
        }

        .warp-mc-topbar strong {
          color: #f0eaff;
        }

        .warp-mc-server-tabs {
          display: flex;
          gap: clamp(15px, 3vw, 45px);
          overflow: hidden;
        }

        .warp-mc-server-tab {
          color: #aaa9b5;
          opacity: .4;
          transition: opacity .3s, color .3s;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: inherit;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .warp-mc-server-tab.active {
          opacity: 1;
          color: #bce784;
        }

        .warp-mc-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          margin-right: 7px;
          border-radius: 50%;
          background: #bce784;
          box-shadow: 0 0 10px #bce78488;
        }

        .warp-mc-server-tab:not(.active) .warp-mc-dot {
          background: #aaa9b5;
          box-shadow: none;
        }

        .warp-mc-terminal-body {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          padding: 30px;
        }

        .warp-mc-output {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-wrap: anywhere;
          scrollbar-width: none;
          font-size: clamp(11px, 1.45vw, 18px);
          line-height: 1.5;
        }

        .warp-mc-output::-webkit-scrollbar {
          display: none;
        }

        .warp-mc-line {
          min-height: 1.5em;
          white-space: pre-wrap;
        }

        .warp-mc-dock {
          flex-shrink: 0;
          padding-top: 15px;
        }

        .warp-mc-activity {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 18px;
          font-size: clamp(10px, 1.3vw, 16px);
        }

        .warp-mc-spinner {
          display: inline-block;
          width: 15px;
          height: 15px;
          border: 3px solid #574762;
          border-top-color: #c59fff;
          border-radius: 50%;
          vertical-align: middle;
          margin-right: 8px;
          animation: warpMcSpin .8s linear infinite;
        }

        @keyframes warpMcSpin {
          to { transform: rotate(360deg); }
        }

        .warp-mc-working {
          color: #c59fff;
        }

        .warp-mc-composer {
          height: 58px;
          border: 1px solid #9395aa;
          display: flex;
          align-items: center;
          padding: 0 18px;
          font-size: clamp(10px, 1.3vw, 16px);
          gap: 10px;
          background: transparent;
        }

        .warp-mc-prompt {
          color: #bce784;
        }

        .warp-mc-cursor {
          width: 11px;
          height: 23px;
          background: #f5f5f5;
          display: inline-block;
          animation: warpMcBlink 1s steps(2) infinite;
        }

        @keyframes warpMcBlink {
          50% { opacity: 0; }
        }

        .warp-mc-input-hint {
          color: #a5a7ad;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .warp-mc-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 14px;
          font-size: clamp(9px, 1.2vw, 15px);
          color: #a5a7ad;
        }

        .warp-mc-added {
          color: #bce784;
        }

        .warp-mc-removed {
          color: #d88d82;
        }

        @media(max-width: 650px) {
          .warp-mc-terminal {
            aspect-ratio: auto;
            min-height: 550px;
          }
          .warp-mc-topbar {
            padding: 0 12px;
            gap: 12px;
          }
          .warp-mc-server-tabs {
            gap: 15px;
          }
          .warp-mc-terminal-body {
            padding: 16px;
          }
          .warp-mc-activity {
            flex-wrap: wrap;
          }
          .warp-mc-composer {
            padding: 0 10px;
          }
        }
      `}</style>

      <div className="warp-mc-terminal">
        {/* SERVER TOP BAR */}
        <div className="warp-mc-topbar">
          <strong>Server:</strong>
          <strong>Minecraft</strong>

          <div className="warp-mc-server-tabs">
            {TABS.map((tab, idx) => (
              <button
                key={tab.name}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`warp-mc-server-tab ${activeTab === idx ? 'active' : ''}`}
              >
                <span className="warp-mc-dot" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TERMINAL BODY */}
        <div className="warp-mc-terminal-body">
          <div ref={outputRef} className="warp-mc-output">
            {lines.map((line) => (
              <div
                key={line.id}
                className="warp-mc-line"
                style={{ color: COLOR_MAP[line.color] }}
              >
                {line.text}
              </div>
            ))}
          </div>

          {/* BOTTOM DOCK */}
          <div className="warp-mc-dock">
            <div className="warp-mc-activity">
              <span className="warp-mc-working">
                <span className="warp-mc-spinner" />
                Server running...
              </span>

              <span style={{ color: '#a5a7ad' }}>
                {serverStats}
              </span>
            </div>

            <form onSubmit={handleCommandSubmit} className="warp-mc-composer">
              <span className="warp-mc-prompt">&gt;</span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter a server command • /help for commands • Tab to autocomplete"
                className="flex-1 bg-transparent border-0 outline-none font-mono text-[clamp(10px,1.3vw,16px)]"
                style={{ color: '#d8d9de' }}
              />
              {!inputValue && <span className="warp-mc-cursor" />}
            </form>

            <div className="warp-mc-status">
              <span>
                Minecraft Server ~/server ⊢ survival |{' '}
                <span className="warp-mc-added">+{playerCount}</span>{' '}
                <span className="warp-mc-removed">-0</span>
              </span>

              <span>{uptime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
