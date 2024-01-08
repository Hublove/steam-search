import { App, PluginSettingTab, Setting } from "obsidian";
import SteamSearch from "./main";

/**
 * Interface for the plugin settings.
 */
export interface SteamSearchPluginSettings {
    folder: string; // new file location
    openNote: boolean; // open note after creation
}

/**
 * Default plugin settings.
 */
export const DEFAULT_SETTINGS: SteamSearchPluginSettings = {
    folder: '',
    openNote: false
};

/**
 * Plugin setting tab for SteamSearch.
 */
export class SteamSearchSettingsTab extends PluginSettingTab {
    public plugin: SteamSearch;
    folder: string;

    /**
     * Constructor for the SteamSearchSettingsTab class.
     * @param app - The Obsidian App.
     * @param plugin - The SteamSearch plugin.
     */
    constructor(app: App, plugin: SteamSearch) {
        super(app, plugin);
        this.plugin = plugin;
    }

    /**
     * Get the plugin settings.
     * @returns The plugin settings.
     */
    get settings() {
        return this.plugin.settings;
    }

    /**
     * Display the settings tab.
     */
    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: "SteamSearch Settings" });

        // New file location
        new Setting(containerEl)
            .setName('New file location')
            .setDesc('New game notes will be placed here.')
            .addSearch(cb => {
                cb.setPlaceholder('Example: folder1/folder2')
                    .setValue(this.plugin.settings.folder)
                    .onChange(new_folder => {
                        this.plugin.settings.folder = new_folder;
                        this.plugin.saveSettings();
                    });
            });

        // Open Note
        new Setting(containerEl)
            .setName('Open Note')
            .setDesc('Open notes after creation.')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.openNote)
                    .onChange((value) => {
                        this.plugin.settings.openNote = value;
                        this.plugin.saveSettings();
                    });
            });
    }
}