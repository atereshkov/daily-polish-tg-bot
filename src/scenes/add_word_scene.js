import { Scenes } from 'telegraf';

import * as constants from '../constants.js';
import * as db from '../database/database.js';
import * as analytics from '../analytics/analytics.js';

const addWordScene = new Scenes.WizardScene(
    constants.SCENE_ID_ADD_WORD,
    async (ctx) => {
        const reply = ""
            'Enter a word, translations and right translation. Everything should start from a capital letter\n\n'
            'Example:\n'
            'Lotnisko\n'
            'Аэропорт, Лётчик, Лотерея, Лот\n'
            'Аэропорт'
        "";
        await ctx.reply('Enter a word, translations and right translation. Everything should start from a capital letter');
        ctx.wizard.state.word = {};
        return ctx.wizard.next();
    },
    async (ctx) => {
        const array = ctx.message.text.split('\n');
        // if (ctx.message.text.length <= 1) {
        if (array.length < 3) {
            ctx.reply('Incorrect format. Make sure you have entered each part separately as a new line');
            return;
        }
        const word = array[0];
        const translations = array[1].split(', ');
        const rightTranslation = array[2];

        ctx.wizard.state.word.origin = word;
        
        if (translations.count <= 2 || translations.count > 4) {
            await ctx.reply('Enter translations separated with , (min 2 and max 4)');
            return;
        }
        ctx.wizard.state.word.translations = translations;

        if (!translations.includes(rightTranslation)) {
            ctx.reply('Please enter right translation');
            return;
        }
        ctx.wizard.state.word.rightTranslation = rightTranslation;

        try {
            await db.saveWord(ctx.wizard.state.word);
            analytics.trackWordAdded(ctx.from.id, ctx.wizard.state.word.origin);
            await ctx.reply('Thank you for adding a new word!');
        } catch (error) {
            console.log(error);
            await ctx.reply(`Error occurred: ${error.detail}`);
        }
        return ctx.scene.leave();
    }
);

export default addWordScene;