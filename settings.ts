import { App, PluginSettingTab, Setting } from "obsidian";
import SteamSearch from "./main";

export interface SteamSearchPluginSettings {
    folder: string; // new file location
}

export const DEFAULT_SETTINGS: SteamSearchPluginSettings = {
    folder: '',
};

export class SteamSearchSettingsTab extends PluginSettingTab {
	public plugin: SteamSearch;
    folder: string;

	constructor(app: App, plugin: SteamSearch) {
		super(app, plugin);
		this.plugin = plugin;
	}

    get settings() {
        return this.plugin.settings;
    }

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: "SteamSearch Settings" });

        // New file location
        new Setting(containerEl)
            .setName('New file location')
            .setDesc('New game notes will be placed here.')
            .addSearch(cb => {
            try {
                // new FolderSuggest(this.app, cb.inputEl);
            } catch {
                // eslint-disable
            }
            cb.setPlaceholder('Example: folder1/folder2')
                .setValue(this.plugin.settings.folder)
                .onChange(new_folder => {
                this.plugin.settings.folder = new_folder;
                this.plugin.saveSettings();
                });
            });
	}
}