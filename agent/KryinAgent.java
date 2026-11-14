/*
 * KryinCraftPanel - Lightweight Android/Termux Server Management Agent
 * Targeted for: Dedicated High-Performance Indian Node (Termux ARM64)
 * Runtime: OpenJDK (Standard libraries ONLY - Zero external dependencies)
 */

import java.io.*;
import java.net.*;
import java.net.http.*;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;
import java.util.regex.*;
import java.util.zip.GZIPInputStream;

public class KryinAgent {

    // Default Configuration
    private static String backendUrl = "https://kryincraftpanel.vercel.app";
    private static String agentToken = "kryin_agent_node_token";
    private static String serverDir = System.getProperty("user.home") + "/minecraft/server";
    private static String rconHost = "127.0.0.1";
    private static int rconPort = 25575;
    private static String rconPassword = "334001";

    // Polling Intervals (milliseconds)
    private static int heartbeatIntervalMs = 30000; // 30 sec
    private static int metricsIntervalMs = 10000;   // 10 sec
    private static int commandPollIntervalMs = 3000; // 3 sec

    private static final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private static volatile boolean running = true;
    private static Process minecraftProcess = null;
    private static Long lastCpuTotal = null;
    private static Long lastCpuIdle = null;

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("   KryinCraftPanel Lightweight Termux Node Agent");
        System.out.println("   Target: Indian Node (Android / Termux aarch64)");
        System.out.println("   Runtime: OpenJDK (Standard Libraries Only)");
        System.out.println("==================================================");

        loadConfig();

        // Register shutdown hook
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("[Agent] Shutting down KryinAgent gracefully...");
            running = false;
        }));

        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);

        // Task 1: Heartbeat (every 30s)
        scheduler.scheduleAtFixedRate(KryinAgent::sendHeartbeat, 0, heartbeatIntervalMs, TimeUnit.MILLISECONDS);

        // Task 2: Hardware Metrics (every 10s)
        scheduler.scheduleAtFixedRate(KryinAgent::sendMetrics, 2000, metricsIntervalMs, TimeUnit.MILLISECONDS);

        // Task 3: Command Polling (every 3s)
        scheduler.scheduleWithFixedDelay(KryinAgent::pollAndExecuteCommands, 3000, commandPollIntervalMs, TimeUnit.MILLISECONDS);

        // Task 4: Player & Stats Synchronization (every 20s)
        scheduler.scheduleWithFixedDelay(KryinAgent::syncPlayers, 4000, 20000, TimeUnit.MILLISECONDS);

        // Task 5: Live Console Log Streaming (every 2.5s)
        scheduler.scheduleWithFixedDelay(KryinAgent::syncConsoleLogs, 1500, 2500, TimeUnit.MILLISECONDS);

        System.out.println("[Agent] Agent initialized and polling outbound to: " + backendUrl);

        while (running) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                break;
            }
        }
        scheduler.shutdown();
    }

    private static void loadConfig() {
        Path configPath = Paths.get("agent.json");
        if (!Files.exists(configPath)) {
            // Check in home directory
            configPath = Paths.get(System.getProperty("user.home"), "minecraft", "agent", "agent.json");
        }

        if (Files.exists(configPath)) {
            try {
                String content = Files.readString(configPath);
                String val;
                if ((val = extractJsonString(content, "backendUrl")) != null) backendUrl = val;
                if ((val = extractJsonString(content, "agentToken")) != null) agentToken = val;
                if ((val = extractJsonString(content, "serverDir")) != null) serverDir = val;
                if ((val = extractJsonString(content, "rconHost")) != null) rconHost = val;
                if ((val = extractJsonString(content, "rconPassword")) != null) rconPassword = val;
                Integer p = extractJsonInt(content, "rconPort");
                if (p != null) rconPort = p;

                System.out.println("[Agent] Loaded configuration from: " + configPath.toAbsolutePath());
            } catch (Exception e) {
                System.err.println("[Agent] Warning: Could not read config file, using defaults: " + e.getMessage());
            }
        } else {
            System.out.println("[Agent] No agent.json found, using default parameters.");
        }
    }

    // =========================================================================
    // 1. HEARTBEAT
    // =========================================================================
    private static void sendHeartbeat() {
        try {
            Long pid = getMinecraftPid();
            String status = pid != null ? "online" : "offline";
            String localIp = detectLocalIp();

            StringBuilder json = new StringBuilder("{");
            json.append("\"status\":\"").append(status).append("\",");
            json.append("\"pid\":").append(pid != null ? pid : "null").append(",");
            json.append("\"tps\":20.0,");
            json.append("\"uptime_seconds\":").append(pid != null ? 3600 : 0).append(",");
            json.append("\"local_ip\":\"").append(localIp).append("\",");
            json.append("\"online_players\":0,");
            json.append("\"max_players\":20");
            json.append("}");

            postHttp("/api/agent/heartbeat", json.toString());
        } catch (Exception e) {
            System.err.println("[Agent] Heartbeat error: " + e.getMessage());
        }
    }

    // =========================================================================
    // 2. HARDWARE METRICS
    // =========================================================================
    private static void sendMetrics() {
        try {
            // Memory from /proc/meminfo
            long totalRamMb = 12288;
            long availRamMb = 6000;
            try {
                List<String> memLines = Files.readAllLines(Paths.get("/proc/meminfo"));
                for (String line : memLines) {
                    if (line.startsWith("MemTotal:")) totalRamMb = parseKbToMb(line);
                    if (line.startsWith("MemAvailable:")) availRamMb = parseKbToMb(line);
                }
            } catch (Exception ignored) {}
            long usedRamMb = Math.max(0, totalRamMb - availRamMb);

            // Java process heap
            long javaHeapUsedMb = 0;
            Long pid = getMinecraftPid();
            if (pid != null) {
                // Estimate Java process RSS from /proc/[pid]/status
                try {
                    List<String> statusLines = Files.readAllLines(Paths.get("/proc/" + pid + "/status"));
                    for (String l : statusLines) {
                        if (l.startsWith("VmRSS:")) javaHeapUsedMb = parseKbToMb(l);
                    }
                } catch (Exception ignored) {}
            }

            // CPU load from /proc/stat
            double cpuPercent = calculateCpuUsage();

            // Thermals from /sys/class/thermal/ (if readable on Android 13)
            Double cpuTemp = readThermalZone();

            // Battery from /sys/class/power_supply/battery/
            int batteryPercent = 80;
            Double batteryTemp = null;
            boolean isCharging = false;
            String powerSource = "Battery";

            try {
                Path battDir = Paths.get("/sys/class/power_supply/battery");
                if (Files.exists(battDir)) {
                    Path cap = battDir.resolve("capacity");
                    if (Files.exists(cap)) batteryPercent = Integer.parseInt(Files.readString(cap).trim());

                    Path statusPath = battDir.resolve("status");
                    if (Files.exists(statusPath)) {
                        String s = Files.readString(statusPath).trim();
                        isCharging = "Charging".equalsIgnoreCase(s) || "Full".equalsIgnoreCase(s);
                        powerSource = isCharging ? "USB-PD / AC" : "Battery";
                    }

                    Path tempPath = battDir.resolve("temp");
                    if (Files.exists(tempPath)) {
                        double raw = Double.parseDouble(Files.readString(tempPath).trim());
                        batteryTemp = raw > 1000 ? raw / 10.0 : raw; // Android battery temp is usually in 0.1°C
                    }
                }
            } catch (Exception ignored) {}

            StringBuilder json = new StringBuilder("{");
            json.append("\"total_ram_mb\":").append(totalRamMb).append(",");
            json.append("\"used_ram_mb\":").append(usedRamMb).append(",");
            json.append("\"available_ram_mb\":").append(availRamMb).append(",");
            json.append("\"java_heap_used_mb\":").append(javaHeapUsedMb).append(",");
            json.append("\"java_heap_max_mb\":4096,");
            json.append("\"cpu_usage_percent\":").append(String.format(Locale.US, "%.1f", cpuPercent)).append(",");
            json.append("\"cpu_temp_c\":").append(cpuTemp != null ? cpuTemp : "null").append(",");
            json.append("\"battery_percent\":").append(batteryPercent).append(",");
            json.append("\"battery_temp_c\":").append(batteryTemp != null ? String.format(Locale.US, "%.1f", batteryTemp) : "null").append(",");
            json.append("\"is_charging\":").append(isCharging).append(",");
            json.append("\"power_source\":\"").append(powerSource).append("\"");
            json.append("}");

            postHttp("/api/agent/metrics", json.toString());
        } catch (Exception e) {
            System.err.println("[Agent] Metrics error: " + e.getMessage());
        }
    }

    // =========================================================================
    // 3. COMMAND POLLING & EXECUTION
    // =========================================================================
    private static void pollAndExecuteCommands() {
        try {
            String response = getHttp("/api/agent/commands");
            if (response == null || !response.contains("\"commands\":")) return;

            // Simple command array extraction
            int startIdx = response.indexOf("\"commands\":[");
            if (startIdx == -1) return;
            startIdx += 12;
            int endIdx = response.lastIndexOf("]");
            if (endIdx <= startIdx) return;

            String items = response.substring(startIdx, endIdx).trim();
            if (items.isEmpty()) return;

            // Split commands by JSON object boundaries
            String[] cmdBlocks = items.split("\\},\\{");
            for (String block : cmdBlocks) {
                String clean = block;
                if (!clean.startsWith("{")) clean = "{" + clean;
                if (!clean.endsWith("}")) clean = clean + "}";

                String id = extractJsonString(clean, "id");
                String type = extractJsonString(clean, "command_type");
                if (id == null || type == null) continue;

                System.out.println("[Agent] Received command: " + type + " (ID: " + id + ")");
                executeCommand(id, type, clean);
            }
        } catch (Exception e) {
            System.err.println("[Agent] Command poll error: " + e.getMessage());
        }
    }

    private static void executeCommand(String id, String type, String rawJson) {
        String resultStatus = "EXECUTED";
        String replyMsg = "Success";

        try {
            switch (type) {
                case "START":
                    replyMsg = startServerProcess();
                    break;
                case "STOP":
                    replyMsg = stopServerProcessGracefully();
                    break;
                case "RESTART":
                    stopServerProcessGracefully();
                    Thread.sleep(1500);
                    replyMsg = startServerProcess();
                    break;
                case "CONSOLE_CMD":
                    String cmd = extractJsonString(rawJson, "command");
                    if (cmd == null) cmd = "list";
                    replyMsg = executeRcon(cmd);
                    break;
                case "PLAYER_ACTION":
                    String actionCmd = extractJsonString(rawJson, "command");
                    if (actionCmd != null) replyMsg = executeRcon(actionCmd);
                    break;
                default:
                    resultStatus = "FAILED";
                    replyMsg = "Unsupported command type: " + type;
            }
        } catch (Exception e) {
            resultStatus = "FAILED";
            replyMsg = "Execution failed: " + e.getMessage();
        }

        // Report result back
        try {
            String json = "{\"command_id\":\"" + id + "\",\"status\":\"" + resultStatus + "\",\"result\":{\"message\":\"" + escapeJson(replyMsg) + "\"}}";
            postHttp("/api/agent/result", json);
            System.out.println("[Agent] Reported command " + id + " as " + resultStatus);
        } catch (Exception e) {
            System.err.println("[Agent] Failed to report command result: " + e.getMessage());
        }
    }

    // =========================================================================
    // PROCESS MANAGEMENT
    // =========================================================================
    private static synchronized String startServerProcess() {
        Long existingPid = getMinecraftPid();
        if (existingPid != null) {
            return "Server is already running with PID " + existingPid;
        }

        try {
            try {
                new ProcessBuilder("termux-wake-lock").start();
            } catch (Exception ignored) {}

            File dir = new File(serverDir);
            if (!dir.exists()) {
                return "Server directory not found: " + serverDir;
            }

            ProcessBuilder pb = new ProcessBuilder(
                    "java", "-Xms1G", "-Xmx4G", "-jar", "server.jar", "--nogui"
            );
            pb.directory(dir);
            pb.redirectErrorStream(true);
            pb.redirectOutput(new File(dir, "logs/latest.log"));

            minecraftProcess = pb.start();
            long pid = minecraftProcess.pid();

            // Save PID file
            Files.writeString(Paths.get(serverDir, ".server.pid"), String.valueOf(pid));
            System.out.println("[Agent] Paper 26.3 started safely with PID " + pid);
            return "Paper server process started with PID " + pid;
        } catch (Exception e) {
            return "Failed to launch Paper: " + e.getMessage();
        }
    }

    private static synchronized String stopServerProcessGracefully() {
        Long pid = getMinecraftPid();
        if (pid == null) {
            return "Server is already offline";
        }

        // 1. Try local RCON stop
        String rconResult = executeRcon("stop");
        System.out.println("[Agent] Issued RCON stop: " + rconResult);

        // 2. Wait up to 15 seconds for clean exit
        for (int i = 0; i < 15; i++) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException ignored) {}
            if (getMinecraftPid() == null) {
                // Remove PID file
                try {
                    Files.deleteIfExists(Paths.get(serverDir, ".server.pid"));
                } catch (Exception ignored) {}
                return "Server stopped gracefully.";
            }
        }

        return "Stop signal sent via RCON. Process is completing chunk flush.";
    }

    private static Long getMinecraftPid() {
        Path pidFile = Paths.get(serverDir, ".server.pid");
        if (Files.exists(pidFile)) {
            try {
                String val = Files.readString(pidFile).trim();
                long pid = Long.parseLong(val);
                // Check if process exists in /proc/[pid]
                if (Files.exists(Paths.get("/proc/" + pid))) {
                    return pid;
                }
            } catch (Exception ignored) {}
        }

        if (minecraftProcess != null && minecraftProcess.isAlive()) {
            return minecraftProcess.pid();
        }

        // Fallback: search process list for running server.jar or paper
        try {
            Process p = new ProcessBuilder("pgrep", "-f", "paper.*\\.jar|server\\.jar").start();
            try (BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
                String line = r.readLine();
                if (line != null && !line.trim().isEmpty()) {
                    return Long.parseLong(line.trim().split("\\s+")[0]);
                }
            }
        } catch (Exception ignored) {}

        return null;
    }

    // =========================================================================
    // BUILT-IN MINECRAFT RCON CLIENT (Pure Java Sockets - Zero External JARs)
    // =========================================================================
    private static String executeRcon(String command) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(rconHost, rconPort), 3000);
            socket.setSoTimeout(5000);
            OutputStream out = socket.getOutputStream();
            InputStream in = socket.getInputStream();

            // 1. Authenticate (Type = 3)
            sendRconPacket(out, 1, 3, rconPassword);
            RconPacket authResp = readRconPacket(in);
            if (authResp.id == -1) {
                return "RCON Authentication Failed (Check password in agent.json / server.properties)";
            }

            // 2. Execute Command (Type = 2)
            sendRconPacket(out, 2, 2, command);
            RconPacket cmdResp = readRconPacket(in);
            return cmdResp.payload;
        } catch (Exception e) {
            return "RCON unreachable on " + rconHost + ":" + rconPort + " (" + e.getMessage() + ")";
        }
    }

    private static void sendRconPacket(OutputStream out, int id, int type, String payload) throws IOException {
        byte[] body = payload.getBytes(StandardCharsets.UTF_8);
        int length = body.length + 10; // 4 (id) + 4 (type) + body.len + 2 (nulls)

        ByteBuffer buffer = ByteBuffer.allocate(length + 4).order(java.nio.ByteOrder.LITTLE_ENDIAN);
        buffer.putInt(length);
        buffer.putInt(id);
        buffer.putInt(type);
        buffer.put(body);
        buffer.put((byte) 0);
        buffer.put((byte) 0);

        out.write(buffer.array());
        out.flush();
    }

    private static RconPacket readRconPacket(InputStream in) throws IOException {
        byte[] lenBytes = in.readNBytes(4);
        if (lenBytes.length < 4) throw new EOFException();
        int length = ByteBuffer.wrap(lenBytes).order(java.nio.ByteOrder.LITTLE_ENDIAN).getInt();

        byte[] payload = in.readNBytes(length);
        ByteBuffer buf = ByteBuffer.wrap(payload).order(java.nio.ByteOrder.LITTLE_ENDIAN);
        int id = buf.getInt();
        int type = buf.getInt();

        String body = new String(payload, 8, length - 10, StandardCharsets.UTF_8);
        return new RconPacket(id, type, body);
    }

    private static record RconPacket(int id, int type, String payload) {}

    // Cache for file contents based on lastModified to prevent re-reading unchanged files
    private static final Map<String, Long> fileModifiedCache = new ConcurrentHashMap<>();
    private static final Map<String, String> fileContentCache = new ConcurrentHashMap<>();

    // =========================================================================
    // DYNAMIC PLAYER DISCOVERY & REAL STATS SYNCHRONIZATION
    // =========================================================================
    private static void syncPlayers() {
        try {
            Path serverPath = Paths.get(serverDir);
            if (!Files.exists(serverPath)) return;

            // 1. Resolve level-name from server.properties
            String levelName = "world";
            Path propFile = serverPath.resolve("server.properties");
            if (Files.exists(propFile)) {
                try {
                    List<String> lines = Files.readAllLines(propFile);
                    for (String line : lines) {
                        if (line.startsWith("level-name=")) {
                            String val = line.substring("level-name=".length()).trim();
                            if (!val.isEmpty()) levelName = val;
                        }
                    }
                } catch (Exception ignored) {}
            }

            // 2. Discover stats directories and playerdata directories
            List<Path> statsDirs = new ArrayList<>();
            for (String sub : Arrays.asList(levelName + "/stats", "world/stats", "stats")) {
                Path p = serverPath.resolve(sub);
                if (Files.exists(p) && Files.isDirectory(p) && !statsDirs.contains(p)) statsDirs.add(p);
            }

            List<Path> playerdataDirs = new ArrayList<>();
            for (String sub : Arrays.asList(levelName + "/playerdata", "world/playerdata", "playerdata")) {
                Path p = serverPath.resolve(sub);
                if (Files.exists(p) && Files.isDirectory(p) && !playerdataDirs.contains(p)) playerdataDirs.add(p);
            }

            // 3. Map UUID -> Name and metadata
            Map<String, String> uuidToName = new HashMap<>();
            Set<String> ops = new HashSet<>();
            Set<String> whitelist = new HashSet<>();
            Set<String> banned = new HashSet<>();

            // 3a. Parse usercache.json
            Path usercachePath = serverPath.resolve("usercache.json");
            if (Files.exists(usercachePath)) {
                try {
                    String content = Files.readString(usercachePath);
                    Pattern p = Pattern.compile("\\{[^}]*\\}");
                    Matcher m = p.matcher(content);
                    while (m.find()) {
                        String block = m.group();
                        String name = extractJsonString(block, "name");
                        String u = extractJsonString(block, "uuid");
                        if (name != null && u != null) {
                            String clean = u.toLowerCase();
                            uuidToName.put(clean, name);
                            uuidToName.put(clean.replace("-", ""), name);
                        }
                    }
                } catch (Exception ignored) {}
            }

            // 3b. Parse ops.json
            Path opsPath = serverPath.resolve("ops.json");
            if (Files.exists(opsPath)) {
                try {
                    String content = Files.readString(opsPath);
                    Pattern p = Pattern.compile("\\{[^}]*\\}");
                    Matcher m = p.matcher(content);
                    while (m.find()) {
                        String block = m.group();
                        String u = extractJsonString(block, "uuid");
                        String name = extractJsonString(block, "name");
                        if (u != null) {
                            String clean = u.toLowerCase();
                            ops.add(clean);
                            ops.add(clean.replace("-", ""));
                            if (name != null) {
                                uuidToName.put(clean, name);
                                uuidToName.put(clean.replace("-", ""), name);
                            }
                        }
                    }
                } catch (Exception ignored) {}
            }

            // 3c. Parse whitelist.json
            Path wlPath = serverPath.resolve("whitelist.json");
            if (Files.exists(wlPath)) {
                try {
                    String content = Files.readString(wlPath);
                    Pattern p = Pattern.compile("\\{[^}]*\\}");
                    Matcher m = p.matcher(content);
                    while (m.find()) {
                        String block = m.group();
                        String u = extractJsonString(block, "uuid");
                        String name = extractJsonString(block, "name");
                        if (u != null) {
                            String clean = u.toLowerCase();
                            whitelist.add(clean);
                            whitelist.add(clean.replace("-", ""));
                            if (name != null) {
                                uuidToName.put(clean, name);
                                uuidToName.put(clean.replace("-", ""), name);
                            }
                        }
                    }
                } catch (Exception ignored) {}
            }

            // 3d. Parse banned-players.json
            Path banPath = serverPath.resolve("banned-players.json");
            if (Files.exists(banPath)) {
                try {
                    String content = Files.readString(banPath);
                    Pattern p = Pattern.compile("\\{[^}]*\\}");
                    Matcher m = p.matcher(content);
                    while (m.find()) {
                        String block = m.group();
                        String u = extractJsonString(block, "uuid");
                        String name = extractJsonString(block, "name");
                        if (u != null) {
                            String clean = u.toLowerCase();
                            banned.add(clean);
                            banned.add(clean.replace("-", ""));
                            if (name != null) {
                                uuidToName.put(clean, name);
                                uuidToName.put(clean.replace("-", ""), name);
                            }
                        }
                    }
                } catch (Exception ignored) {}
            }

            // 4. Collect ALL player UUIDs dynamically across usercache, stats files, and playerdata files
            Set<String> allUuids = new LinkedHashSet<>(uuidToName.keySet());

            // Scan stats directories for any additional player files
            for (Path dir : statsDirs) {
                try (var stream = Files.list(dir)) {
                    stream.forEach(f -> {
                        String fname = f.getFileName().toString();
                        if (fname.endsWith(".json")) {
                            String u = fname.substring(0, fname.length() - 5).toLowerCase();
                            allUuids.add(u);
                        }
                    });
                } catch (Exception ignored) {}
            }

            // Scan playerdata directories for any additional player files
            for (Path dir : playerdataDirs) {
                try (var stream = Files.list(dir)) {
                    stream.forEach(f -> {
                        String fname = f.getFileName().toString();
                        if (fname.endsWith(".dat")) {
                            String u = fname.substring(0, fname.length() - 4).toLowerCase();
                            allUuids.add(u);
                        }
                    });
                } catch (Exception ignored) {}
            }

            if (allUuids.isEmpty()) return;

            // 5. Query online player names via local RCON
            Set<String> onlineNames = new HashSet<>();
            try {
                String rconList = executeRcon("list");
                if (rconList != null && rconList.contains(":")) {
                    String namesPart = rconList.substring(rconList.indexOf(":") + 1).trim();
                    for (String n : namesPart.split(",")) {
                        String clean = n.trim();
                        if (!clean.isEmpty()) onlineNames.add(clean.toLowerCase());
                    }
                }
            } catch (Exception ignored) {}

            // 6. Build the dynamic player objects array
            StringBuilder playersJson = new StringBuilder("{\"players\":[");
            boolean first = true;

            for (String u : allUuids) {
                String name = uuidToName.get(u);
                if (name == null || name.trim().isEmpty()) {
                    name = uuidToName.get(u.replace("-", ""));
                }

                boolean isOnline = onlineNames.contains(name.toLowerCase());
                boolean isOp = ops.contains(u);
                boolean isWhitelisted = whitelist.contains(u);
                boolean isBanned = banned.contains(u);

                // Read real JSON stats file (with lastModified cache for 0% CPU strain)
                String statsJson = "{}";
                for (Path sDir : statsDirs) {
                    Path sFile = sDir.resolve(u + ".json");
                    if (Files.exists(sFile)) {
                        try {
                            long lastMod = Files.getLastModifiedTime(sFile).toMillis();
                            String cacheKey = "stats_" + u;
                            if (fileModifiedCache.getOrDefault(cacheKey, 0L) == lastMod && fileContentCache.containsKey(cacheKey)) {
                                statsJson = fileContentCache.get(cacheKey);
                            } else {
                                statsJson = Files.readString(sFile).trim();
                                fileModifiedCache.put(cacheKey, lastMod);
                                fileContentCache.put(cacheKey, statsJson);
                            }
                            break;
                        } catch (Exception ignored) {}
                    }
                }

                // Read real playerdata NBT file if it exists
                double health = 20.0;
                int foodLevel = 20;
                int xpLevel = 0;
                double xpProgress = 0.0;
                String gamemode = "survival";
                double posX = 0.0, posY = 64.0, posZ = 0.0;
                String dimension = "minecraft:overworld";
                String inventoryJson = "{}";

                for (Path pDir : playerdataDirs) {
                    Path pFile = pDir.resolve(u + ".dat");
                    if (Files.exists(pFile)) {
                        try {
                            Map<String, Object> nbt = parseNbtFile(pFile);
                            if (nbt != null && !nbt.isEmpty()) {
                                if (nbt.containsKey("Health")) {
                                    Object h = nbt.get("Health");
                                    if (h instanceof Number) health = ((Number) h).doubleValue();
                                }
                                if (nbt.containsKey("foodLevel")) {
                                    Object f = nbt.get("foodLevel");
                                    if (f instanceof Number) foodLevel = ((Number) f).intValue();
                                }
                                if (nbt.containsKey("XpLevel")) {
                                    Object xl = nbt.get("XpLevel");
                                    if (xl instanceof Number) xpLevel = ((Number) xl).intValue();
                                }
                                if (nbt.containsKey("XpP")) {
                                    Object xp = nbt.get("XpP");
                                    if (xp instanceof Number) xpProgress = ((Number) xp).doubleValue();
                                }
                                if (nbt.containsKey("playerGameType")) {
                                    Object gm = nbt.get("playerGameType");
                                    if (gm instanceof Number) {
                                        int g = ((Number) gm).intValue();
                                        if (g == 1) gamemode = "creative";
                                        else if (g == 2) gamemode = "adventure";
                                        else if (g == 3) gamemode = "spectator";
                                        else gamemode = "survival";
                                    }
                                }
                                if (nbt.containsKey("Pos") && nbt.get("Pos") instanceof List) {
                                    List<?> pos = (List<?>) nbt.get("Pos");
                                    if (pos.size() >= 3) {
                                        if (pos.get(0) instanceof Number) posX = ((Number) pos.get(0)).doubleValue();
                                        if (pos.get(1) instanceof Number) posY = ((Number) pos.get(1)).doubleValue();
                                        if (pos.get(2) instanceof Number) posZ = ((Number) pos.get(2)).doubleValue();
                                    }
                                }
                                if (nbt.containsKey("Dimension")) {
                                    dimension = String.valueOf(nbt.get("Dimension"));
                                }
                                if ((name == null || name.startsWith("Player_")) && nbt.containsKey("bukkit") && nbt.get("bukkit") instanceof Map) {
                                    Map<?, ?> bukkitMap = (Map<?, ?>) nbt.get("bukkit");
                                    if (bukkitMap.containsKey("lastKnownName") && bukkitMap.get("lastKnownName") != null) {
                                        String lkn = String.valueOf(bukkitMap.get("lastKnownName")).trim();
                                        if (!lkn.isEmpty()) {
                                            name = lkn;
                                        }
                                    }
                                }
                                inventoryJson = formatInventoryJson(nbt);
                            }
                            break;
                        } catch (Exception ignored) {}
                    }
                }

                if (name == null || name.trim().isEmpty()) {
                    name = "Player_" + (u.length() >= 8 ? u.substring(0, 8) : u);
                }

                if (!first) playersJson.append(",");
                first = false;

                playersJson.append("{");
                playersJson.append("\"uuid\":\"").append(u).append("\",");
                playersJson.append("\"username\":\"").append(escapeJson(name)).append("\",");
                playersJson.append("\"is_online\":").append(isOnline).append(",");
                playersJson.append("\"is_op\":").append(isOp).append(",");
                playersJson.append("\"is_whitelisted\":").append(isWhitelisted).append(",");
                playersJson.append("\"is_banned\":").append(isBanned).append(",");
                playersJson.append("\"health\":").append(String.format(Locale.US, "%.1f", health)).append(",");
                playersJson.append("\"food_level\":").append(foodLevel).append(",");
                playersJson.append("\"xp_level\":").append(xpLevel).append(",");
                playersJson.append("\"xp_progress\":").append(String.format(Locale.US, "%.2f", xpProgress)).append(",");
                playersJson.append("\"gamemode\":\"").append(gamemode).append("\",");
                playersJson.append("\"coordinates\":{\"x\":").append(String.format(Locale.US, "%.2f", posX))
                        .append(",\"y\":").append(String.format(Locale.US, "%.2f", posY))
                        .append(",\"z\":").append(String.format(Locale.US, "%.2f", posZ))
                        .append(",\"dimension\":\"").append(escapeJson(dimension)).append("\"},");
                playersJson.append("\"inventory\":").append(inventoryJson).append(",");
                playersJson.append("\"statistics\":").append(statsJson.isEmpty() ? "{}" : statsJson);
                playersJson.append("}");
            }

            playersJson.append("]}");

            postHttp("/api/agent/players", playersJson.toString());
        } catch (Exception e) {
            System.err.println("[Agent] Player sync error: " + e.getMessage());
        }
    }

    // =========================================================================
    // 5. CONSOLE LOG STREAMING (reads latest.log and syncs to portal)
    // =========================================================================
    private static long lastLogFilePointer = 0;

    private static void syncConsoleLogs() {
        try {
            File logFile = new File(serverDir, "logs/latest.log");
            if (!logFile.exists()) {
                logFile = new File("logs/latest.log");
                if (!logFile.exists()) return;
            }

            long fileLen = logFile.length();
            if (fileLen < lastLogFilePointer) {
                lastLogFilePointer = 0;
            }

            if (fileLen <= lastLogFilePointer) {
                return;
            }

            // On first pass: start near the tail (last 12KB) to avoid flooding old history
            if (lastLogFilePointer == 0 && fileLen > 12000) {
                lastLogFilePointer = fileLen - 12000;
            }

            List<String> newLines = new ArrayList<>();
            try (RandomAccessFile raf = new RandomAccessFile(logFile, "r")) {
                raf.seek(lastLogFilePointer);
                String rawLine;
                while ((rawLine = raf.readLine()) != null && newLines.size() < 30) {
                    String utf8Line = new String(rawLine.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8).trim();
                    if (!utf8Line.isEmpty()) {
                        newLines.add(utf8Line);
                    }
                }
                lastLogFilePointer = raf.getFilePointer();
            }

            if (!newLines.isEmpty()) {
                StringBuilder json = new StringBuilder("{\"logs\":[");
                String timeStr = new java.text.SimpleDateFormat("HH:mm:ss").format(new Date());
                for (int i = 0; i < newLines.size(); i++) {
                    if (i > 0) json.append(",");
                    String l = newLines.get(i);
                    String level = "INFO";
                    if (l.contains("/WARN]")) level = "WARN";
                    else if (l.contains("/ERROR]")) level = "ERROR";

                    json.append("{\"timestamp\":\"").append(timeStr).append("\",");
                    json.append("\"level\":\"").append(level).append("\",");
                    json.append("\"message\":\"").append(escapeJson(l)).append("\"}");
                }
                json.append("]}");
                postHttp("/api/agent/logs", json.toString());
            }
        } catch (Exception ignored) {}
    }

    // =========================================================================
    // LIGHTWEIGHT PURE-JAVA NBT PARSER (ZERO EXTERNAL LIBRARIES)
    // =========================================================================
    private static Map<String, Object> parseNbtFile(Path datFile) {
        if (!Files.exists(datFile)) return Collections.emptyMap();
        try (InputStream is = Files.newInputStream(datFile);
             GZIPInputStream gzis = new GZIPInputStream(is);
             DataInputStream dis = new DataInputStream(gzis)) {

            byte rootType = dis.readByte();
            if (rootType != 10) return Collections.emptyMap(); // TAG_Compound
            dis.readUTF(); // Skip root tag name
            return readNbtCompound(dis);
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    private static Map<String, Object> readNbtCompound(DataInputStream dis) throws IOException {
        Map<String, Object> map = new HashMap<>();
        while (true) {
            byte tagType = dis.readByte();
            if (tagType == 0) break; // TAG_End
            String name = dis.readUTF();
            Object val = readNbtPayload(dis, tagType);
            map.put(name, val);
        }
        return map;
    }

    private static Object readNbtPayload(DataInputStream dis, byte type) throws IOException {
        switch (type) {
            case 1: return dis.readByte();
            case 2: return dis.readShort();
            case 3: return dis.readInt();
            case 4: return dis.readLong();
            case 5: return dis.readFloat();
            case 6: return dis.readDouble();
            case 7: {
                int len = dis.readInt();
                byte[] b = new byte[len];
                dis.readFully(b);
                return b;
            }
            case 8: return dis.readUTF();
            case 9: {
                byte elemType = dis.readByte();
                int count = dis.readInt();
                List<Object> list = new ArrayList<>(count);
                for (int i = 0; i < count; i++) {
                    list.add(readNbtPayload(dis, elemType));
                }
                return list;
            }
            case 10: return readNbtCompound(dis);
            case 11: {
                int len = dis.readInt();
                int[] arr = new int[len];
                for (int i = 0; i < len; i++) arr[i] = dis.readInt();
                return arr;
            }
            case 12: {
                int len = dis.readInt();
                long[] arr = new long[len];
                for (int i = 0; i < len; i++) arr[i] = dis.readLong();
                return arr;
            }
            default: return null;
        }
    }

    private static String formatInventoryJson(Map<String, Object> nbt) {
        try {
            Map<Integer, Map<String, Object>> slotMap = new HashMap<>();
            if (nbt.containsKey("Inventory") && nbt.get("Inventory") instanceof List) {
                List<?> items = (List<?>) nbt.get("Inventory");
                for (Object itemObj : items) {
                    if (itemObj instanceof Map) {
                        Map<?, ?> itemMap = (Map<?, ?>) itemObj;
                        Object slotVal = itemMap.get("Slot");
                        if (slotVal instanceof Number) {
                            int slot = ((Number) slotVal).intValue();
                            if (slot < 0) slot = slot & 0xFF; // Unsigned (e.g. -106 => 150 offhand)
                            Map<String, Object> it = new HashMap<>();
                            it.put("id", itemMap.get("id"));
                            it.put("count", itemMap.get("Count") != null ? itemMap.get("Count") : 1);
                            it.put("slot", slot);
                            slotMap.put(slot, it);
                        }
                    }
                }
            }

            StringBuilder inv = new StringBuilder("{");
            // Armor: 103=helmet, 102=chestplate, 101=leggings, 100=boots
            inv.append("\"armor\":{");
            inv.append("\"helmet\":").append(formatItemObj(slotMap.get(103))).append(",");
            inv.append("\"chestplate\":").append(formatItemObj(slotMap.get(102))).append(",");
            inv.append("\"leggings\":").append(formatItemObj(slotMap.get(101))).append(",");
            inv.append("\"boots\":").append(formatItemObj(slotMap.get(100)));
            inv.append("},");

            // Offhand: 150 (signed -106)
            inv.append("\"offhand\":").append(formatItemObj(slotMap.get(150))).append(",");

            // Main inventory: slots 9-35
            inv.append("\"main\":[");
            for (int s = 9; s <= 35; s++) {
                if (s > 9) inv.append(",");
                inv.append(formatItemObj(slotMap.get(s)));
            }
            inv.append("],");

            // Hotbar: slots 0-8
            inv.append("\"hotbar\":[");
            for (int s = 0; s <= 8; s++) {
                if (s > 0) inv.append(",");
                inv.append(formatItemObj(slotMap.get(s)));
            }
            inv.append("]");
            inv.append("}");

            return inv.toString();
        } catch (Exception e) {
            return "{}";
        }
    }

    private static String formatItemObj(Map<String, Object> it) {
        if (it == null || !it.containsKey("id")) return "null";
        String idStr = String.valueOf(it.get("id"));
        int count = 1;
        if (it.get("count") instanceof Number) count = ((Number) it.get("count")).intValue();
        String cleanId = idStr.replace("minecraft:", "");
        String displayName = formatDisplayName(cleanId);

        return "{\"id\":\"" + escapeJson(cleanId) + "\",\"name\":\"" + escapeJson(idStr) + "\",\"displayName\":\"" + escapeJson(displayName) + "\",\"count\":" + count + "}";
    }

    private static String formatDisplayName(String raw) {
        String[] parts = raw.split("_");
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (!p.isEmpty()) {
                if (sb.length() > 0) sb.append(" ");
                sb.append(Character.toUpperCase(p.charAt(0))).append(p.substring(1));
            }
        }
        return sb.toString();
    }

    // =========================================================================
    // HTTP CLIENT HELPERS (Outbound HTTPS only)
    // =========================================================================
    private static String postHttp(String endpoint, String jsonBody) throws Exception {
        String url = backendUrl + endpoint;
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + agentToken)
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                .timeout(Duration.ofSeconds(10))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    private static String getHttp(String endpoint) throws Exception {
        String url = backendUrl + endpoint;
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Authorization", "Bearer " + agentToken)
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    // =========================================================================
    // SYSTEM TELEMETRY HELPERS
    // =========================================================================
    private static double calculateCpuUsage() {
        try {
            String line = Files.lines(Paths.get("/proc/stat")).findFirst().orElse("");
            String[] parts = line.split("\\s+");
            if (parts.length >= 5) {
                long user = Long.parseLong(parts[1]);
                long nice = Long.parseLong(parts[2]);
                long sys = Long.parseLong(parts[3]);
                long idle = Long.parseLong(parts[4]);
                long total = user + nice + sys + idle;

                if (lastCpuTotal != null && lastCpuIdle != null) {
                    long dTotal = total - lastCpuTotal;
                    long dIdle = idle - lastCpuIdle;
                    lastCpuTotal = total;
                    lastCpuIdle = idle;
                    if (dTotal > 0) {
                        return Math.max(0.0, Math.min(100.0, (1.0 - (double) dIdle / dTotal) * 100.0));
                    }
                }
                lastCpuTotal = total;
                lastCpuIdle = idle;
            }
        } catch (Exception ignored) {}
        return 12.0;
    }

    private static Double readThermalZone() {
        for (int i = 0; i <= 20; i++) {
            Path p = Paths.get("/sys/class/thermal/thermal_zone" + i + "/temp");
            if (Files.exists(p)) {
                try {
                    String s = Files.readString(p).trim();
                    double t = Double.parseDouble(s);
                    if (t > 1000) t = t / 1000.0;
                    if (t >= 25.0 && t <= 95.0) return t;
                } catch (Exception ignored) {}
            }
        }
        return null;
    }

    private static String detectLocalIp() {
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface iface = interfaces.nextElement();
                if (iface.isLoopback() || !iface.isUp()) continue;
                Enumeration<InetAddress> addresses = iface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress addr = addresses.nextElement();
                    if (addr instanceof Inet4Address && !addr.isLoopbackAddress()) {
                        return addr.getHostAddress();
                    }
                }
            }
        } catch (Exception ignored) {}
        return "192.168.0.164";
    }

    private static long parseKbToMb(String meminfoLine) {
        String[] parts = meminfoLine.split("\\s+");
        if (parts.length >= 2) {
            long kb = Long.parseLong(parts[1]);
            return kb / 1024;
        }
        return 0;
    }

    private static String extractJsonString(String json, String key) {
        Pattern pattern = Pattern.compile("\"" + key + "\"\\s*:\\s*\"([^\"]+)\"");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) return matcher.group(1);
        return null;
    }

    private static Integer extractJsonInt(String json, String key) {
        Pattern pattern = Pattern.compile("\"" + key + "\"\\s*:\\s*(\\d+)");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) return Integer.parseInt(matcher.group(1));
        return null;
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
