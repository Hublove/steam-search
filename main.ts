import { App, MarkdownView, Menu, MenuItem, Modal, Notice, Plugin, TFile } from 'obsidian';
const myModule = require('./constants.js');
import { KEY } from './constants.js';

class MyPlugin extends Plugin {

    onload() {
        console.log('Hello from your Obsidian plugin!');
        
        
        // Add a command to create a new note
        this.addCommand({
            id: 'create-new-note',
            name: 'Create New Gayer Note',
            callback: () => new MyModal(this.app).open(),
            hotkeys: [],
        });
        
    } 
    
    onunload() {
        console.log('Goodbye from your Obsidian plugin!');
    }
}

class MyModal extends Modal {
    constructor(app: App) {
      super(app);
    }
  
    onOpen() {
        let { contentEl } = this;

        
        // Create a datalist
        let dataList: HTMLDataListElement | null = contentEl.createEl('datalist');
        dataList.id = 'gameSuggestions';
        

        // Create an input field
        let inputEl = contentEl.createEl('input');
        inputEl.type = 'text';
        inputEl.placeholder = 'Enter game title or ID';
        inputEl.style.width = '100%';
        inputEl.setAttribute('list', 'gameSuggestions');

        
        // Add suggestions to the input
        // inputEl.addEventListener('keydown', (event) => {
        //     if (event.key === 'Enter') {
        //         if (dataList) {
        //             while (dataList.firstChild) {
        //                 dataList.removeChild(dataList.firstChild);
        //             }
        //         }
        //         gameSuggestions.forEach(title => {
        //             const suggestion = contentEl.createEl('option');
        //             suggestion.value = title;
        //             if (dataList) {
        //                 dataList.appendChild(suggestion);
        //             }
        //         });
                
        //         console.log("list");
        //         console.log(inputEl.list);
        //         console.log(inputEl);
        //     }
        // });

        inputEl.addEventListener('input', () => {
            setTimeout(() => {
                this.searchGameNames(inputEl.value)
                .then((gameSuggestions: string[]) => {
                    for (let x = 0; x < gameSuggestions.length; x++) {
                        const title = gameSuggestions[x];
                        const suggestion = contentEl.createEl('option');
                        suggestion.value = title;
                        if (dataList) {
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
            let response = this.getGameInfo(userInput.toLowerCase().replace(/\s/g, '').replace(/[^\w\s]/gi, ''));
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
async getGameInfo(input: string): Promise<any> {
    // Fetch game information from the RAWG API
    let response = await fetch(`https://api.rawg.io/api/games/${input}?key=${KEY}`, {method: 'GET',});
    let gameInfo = await response.json();

    // If the game information has a redirect, fetch the information for the redirected game
    if (gameInfo.redirect) {
        response = await fetch(`https://api.rawg.io/api/games/${gameInfo.slug}?key=${KEY}`, {method: 'GET',});
        gameInfo = await response.json();
    }

    const gameName = gameInfo.name;

    // Use the Obsidian API to create a new note with the game information as YAML frontmatter
    const targetFile = await this.app.vault.create(`/${gameName.replace(/[^\w\s]/gi, '')}.md`, "GAYEST NOTE");

    const yamlData = {
        id: gameInfo.id,
        title: gameName,
        tags: gameInfo.tags.map((tag: any) => tag.name).join(', '),
        image: gameInfo.background_image,
        metacritic: gameInfo.metacritic,
        playtime: gameInfo.playtime,
        released: gameInfo.released
    }

    this.addYamlToFrontmatter(targetFile, yamlData);

    return gameInfo;
}
  
    onClose() {
      let { contentEl } = this;
      contentEl.empty();
    }
  }

export default MyPlugin;
