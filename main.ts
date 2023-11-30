import { Menu, MenuItem, Notice, Plugin } from 'obsidian';

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
        const targetFile = await this.app.vault.create("/gay.md", "GAYEST NOTE");

        console.log(targetFile);
    }

    onunload() {
        console.log('Goodbye from your Obsidian plugin!');
    }
}

export default MyPlugin;
