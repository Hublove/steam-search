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
            callback: () => this.createNewNote(),
            hotkeys: [],
        });
        
    } 

    

    async createNewNote() {
        const newNoteContent = 'This is your new note content.';
        const newNoteTitle = 'GAYEST NOTE';
        console.log(`Created new note: ${newNoteTitle}`);

        // Use the Obsidian API to create a new note
        // const targetFile = await this.app.vault.create("/gay.md", "GAYEST NOTE");

        // console.log(this.getGameInfo("minecraft"));

        let modal = new MyModal(this.app).open();
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
  
      // Create an input field
      let inputEl = contentEl.createEl('input');
      inputEl.type = 'text';
  
      // Create a button to submit the input
      let buttonEl = contentEl.createEl('button');
      buttonEl.textContent = 'Submit';
      buttonEl.onClickEvent(() => {
        let userInput = inputEl.value;
        let response = this.getGameInfo(userInput);
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


    

    async getGameInfo(input: string): Promise<any> {
        const response = await fetch(`https://api.rawg.io/api/games/${input}?key=${KEY}`, {method: 'GET',});
        const gameInfo = await response.json();
        const gameName = gameInfo.name;

        // Use the Obsidian API to create a new note
        const targetFile = await this.app.vault.create(`/${gameName}.md`, "GAYEST NOTE");

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
