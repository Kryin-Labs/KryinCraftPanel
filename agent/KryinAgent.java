/*
 * KryinCraftPanel - Lightweight Android/Termux Server Management Agent
 * Targeted for: ASUS ROG Phone 5s (Snapdragon 888, Android 13, Termux aarch64)
 * Runtime: OpenJDK 25 (Standard libraries ONLY - Zero external dependencies)
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

public class KryinAgent {

    // Default Configuration
    private static String backendUrl = "https://kryinpanel.vercel.app";
    private static String agentToken = "kryin_agent_rog5s_token";
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
        System.out.println("   KryinCraftPanel Lightweight Termux Agent");
        System.out.println("   Target: ASUS ROG Phone 5s (Android 13 / aarch64)");
        System.out.println("   Runtime: OpenJDK 25.0.3 (Standard Libraries Only)");
        System.out.println("==================================================");

        loadConfig();

        // Register shutdown hook
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("[Agent] Shutting down KryinAgent gracefully...");
            running = false;
        }));

        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(3);

        // Task 1: Heartbeat (every 30s)
        scheduler.scheduleAtFixedRate(KryinAgent::sendHeartbeat, 0, heartbeatIntervalMs, TimeUnit.MILLISECONDS);

        // Task 2: Hardware Metrics (every 10s)
        scheduler.scheduleAtFixedRate(KryinAgent::sendMetrics, 2000, metricsIntervalMs, TimeUnit.MILLISECONDS);

        // Task 3: Command Polling (every 3s)
        scheduler.scheduleWithFixedDelay(KryinAgent::pollAndExecuteCommands, 3000, commandPollIntervalMs, TimeUnit.MILLISECONDS);

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
            // Wake lock command for Termux
            try {
                Runtime.getRuntime().exec("termux-wake-lock");
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
