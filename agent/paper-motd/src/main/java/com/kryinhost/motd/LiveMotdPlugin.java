package com.kryinhost.motd;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.FileTime;
import java.util.Objects;
import java.util.Properties;
import org.bukkit.plugin.java.JavaPlugin;

public final class LiveMotdPlugin extends JavaPlugin {
    private final Path propertiesFile = Path.of("server.properties");
    private FileTime lastModified;
    private String lastMotd;
    private boolean readFailed;

    @Override
    public void onEnable() {
        getServer().getScheduler().runTaskTimerAsynchronously(this, this::syncMotd, 20L, 40L);
    }

    private void syncMotd() {
        try {
            FileTime modified = Files.getLastModifiedTime(propertiesFile);
            if (modified.equals(lastModified)) return;

            Properties properties = new Properties();
            try (var reader = Files.newBufferedReader(propertiesFile, StandardCharsets.UTF_8)) {
                properties.load(reader);
            }

            String motd = properties.getProperty("motd");
            if (motd != null && !Objects.equals(lastMotd, motd)) {
                getServer().getScheduler().runTask(this, () -> getServer().setMotd(motd));
                lastMotd = motd;
            }
            lastModified = modified;
            readFailed = false;
        } catch (IOException | IllegalArgumentException error) {
            if (!readFailed) {
                getLogger().warning("Could not read the MOTD from server.properties: " + error.getMessage());
                readFailed = true;
            }
        }
    }
}
