import { App, MarkdownView, Menu, MenuItem, Modal, Notice, Plugin, TFile, TFolder } from 'obsidian';
const myModule = require('./constants.js');
import { KEY } from './constants.js';
import { DEFAULT_SETTINGS, SteamSearchPluginSettings, SteamSearchSettingsTab } from 'settings.js';

class SteamSearch extends Plugin {
    settings: SteamSearchPluginSettings;

    /**
     * Asynchronously loads the plugin.
     *
     * @return {Promise<void>} Promise that resolves when the plugin is loaded.
     */
    async onload() {
        console.log('Hello from your Obsidian plugin!');
        this.loadSettings();
        this.addSettingTab(new SteamSearchSettingsTab(this.app, this));


        
        // Add a command to create a new note
        this.addCommand({
            id: 'create-new-note',
            name: 'Create New Gayer Note',
            callback: () => new MyModal(this.app, this).open(),
            hotkeys: [],
        });
        
    } 

    /**
     * Loads the settings by combining the default settings with the data loaded from storage.
     *
     * @return {Promise<void>} A promise that resolves when the settings have been loaded.
     */
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }
    
    /**
     * Saves the settings.
     *
     * @return {Promise<void>} - A promise that resolves when the settings are saved.
     */
    async saveSettings() {
        await this.saveData(this.settings);
        
    }
    
    onunload() {
        console.log('Goodbye from your Obsidian plugin!');
    }
}

class MyModal extends Modal {
    plugin: SteamSearch;

    /**
     * Constructs a new instance of the constructor.
     *
     * @param {App} app - The app parameter.
     * @param {Plugin} plugin - The plugin parameter.
     */
    constructor(app: App, plugin: Plugin) {
        super(app);
        this.plugin = plugin as SteamSearch;
    }
  
    /**
     * Initializes the onOpen function.
     *
     * @return {Promise<void>} - A Promise that resolves when the function has finished executing.
     */
    async onOpen() {
        let { contentEl } = this;
        await this.plugin.loadSettings();

        
        // Create a datalist
        let dataList: HTMLDataListElement | null = contentEl.createEl('datalist');
        dataList.id = 'gameSuggestions';
        

        // Create an input field
        let inputEl = contentEl.createEl('input');
        inputEl.type = 'text';
        inputEl.placeholder = 'Enter game title or ID';
        inputEl.style.width = '100%';
        inputEl.setAttribute('list', 'gameSuggestions');



        // Add an event listener to the input element for the 'input' event
        inputEl.addEventListener('input', () => {
            // Set a timeout of 500 milliseconds before executing the code inside
            setTimeout(() => {
                // Call the searchGameNames function with the value of the input element
                this.searchGameNames(inputEl.value)
                    .then((gameSuggestions: string[]) => {
                        // Iterate over the array of game suggestions
                        for (let x = 0; x < gameSuggestions.length; x++) {
                            const title = gameSuggestions[x];
                            // Create an 'option' element for each suggestion
                            const suggestion = contentEl.createEl('option');
                            suggestion.value = title;
                            if (dataList) {
                                // Append the suggestion to the 'datalist' element
                                dataList.appendChild(suggestion);
                            }
                        }
                    })
                    .catch((error) => {
                        // Handle the error if the promise rejects
                        console.error(error);
                    });
            }, 500);
        });



        // Create a button to submit the input
        let buttonEl = contentEl.createEl('button');
        buttonEl.textContent = 'Submit';
        buttonEl.onClickEvent(() => {
            let userInput = inputEl.value;
            let response = this.getGameInfo(userInput.replace(/[^\w\s]|_/g, "").replace(/\s+/g, "-").toLowerCase(), this.plugin.settings.folder, this.plugin.settings.openNote);
            console.log(response);
            this.close();
        });
    }

/**
 * Adds YAML frontmatter to a note file.
 * 
 * @param {TFile} notePath - The path to the note file.
 * @param {string} yamlData - The YAML data to add to the frontmatter.
 * @returns {Promise<void>} - A promise that resolves when the frontmatter has been added.
 */
async addYamlToFrontmatter(notePath: TFile, yamlData: Object): Promise<void> {
    const noteContent: string = await this.app.vault.read(notePath);
    const updatedContent: string = `---\n${JSON.stringify(yamlData)}\n---\n${noteContent}`;
    await this.app.vault.modify(notePath, updatedContent);
    
}

/**
 * Retrieves a list of game names based on the provided query.
 *
 * @param {string} query - The search query for game names.
 * @return {Promise<string[]>} A promise that resolves to an array of game names.
 */
async searchGameNames(query: string): Promise<string[]> {
    const apiUrl = `https://api.rawg.io/api/games?key=${KEY}&search=${query}`;
  
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      const gameNames = data.results.map((game: any) => game.name);
      return gameNames;
    } catch (error) {
      console.error('Error searching for game:', error);
      return [];
    }
  }
  

    

/**
 * Retrieves game information from the RAWG API and creates a new note with the information.
 * @param input - The game identifier.
 * @returns The game information.
 */
async getGameInfo(input: string, folder: string, openNote: boolean): Promise<any> {
    // let gameInfo = {"name": "", "redirect": false};
    let response;
    let gameInfo;
    // Fetch game information from the RAWG API
    try {
        response = await fetch(`https://api.rawg.io/api/games/${input}?key=${KEY}`, {method: 'GET',});
        gameInfo = await response.json();
        // If the game information has a redirect, fetch the information for the redirected game
        if (gameInfo.redirect) {
            response = await fetch(`https://api.rawg.io/api/games/${gameInfo.slug}?key=${KEY}`, {method: 'GET',});
            gameInfo = await response.json();
    }
    } catch (error) {
        console.error('Error fetching game information:', error);
        return;
    }

    
    console.log(gameInfo);
    const gameName = gameInfo.name;

    // Use the Obsidian API to create a new note with the game information as YAML frontmatter
    let targetFile: TFile;
    let targetFfolder: TFolder;
    if (folder === "") {
        try {
            targetFile = await this.app.vault.create(`/${gameName.replace(/[^\w\s]/gi, '')}.md`, "NEWEST NOTE");
            const yamlData = this.getYamlData(gameInfo);
            this.addYamlToFrontmatter(targetFile, yamlData);   
            if (openNote) {
                this.app.workspace.getLeaf().openFile(targetFile);
            } 
        } catch (error) {
            console.log(error);
            new Notice("File already exists");
        }

    } else {
        console.log(folder);
        try {
            targetFfolder = await this.app.vault.createFolder(folder);
        } catch (error) {
            console.log(error);
            new Notice("Folder already exists");
        }
        try {
            targetFile = await this.app.vault.create(`/${folder}/${gameName.replace(/[^\w\s]/gi, '')}.md`, "NEWEST NOTE");
            const yamlData = this.getYamlData(gameInfo);
            this.addYamlToFrontmatter(targetFile, yamlData);  
            if (openNote) {
                this.app.workspace.getLeaf().openFile(targetFile);
            } 
        } catch (error) {
            console.log(error);
            new Notice("File already exists");
        }
        
    }

    return gameInfo;
}

    getYamlData(gameInfo: { id: any; name: any; tags: any[]; background_image: any; metacritic: any; playtime: any; released: any; }) {

        const yamlData = {
            id: gameInfo.id,
            title: gameInfo.name,
            tags: gameInfo.tags.map((tag: any) => tag.name).join(', '),
            image: gameInfo.background_image,
            metacritic: gameInfo.metacritic,
            playtime: gameInfo.playtime,
            released: gameInfo.released
        }

        return yamlData;
    }
  
    onClose() {
      let { contentEl } = this;
      contentEl.empty();
    }
  }

export default SteamSearch;
