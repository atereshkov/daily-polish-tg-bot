import { Scenes } from 'telegraf';

import * as constants from '../constants.js';
import * as db from '../database/database.js';
import * as analytics from '../analytics/analytics.js';

const addWordScene = new Scenes.WizardScene(
    constants.SCENE_ID_ADD_WORD,
    async (ctx) => {
        const reply = ""
            'Введите слово, переводы (до 4-ех) и правильный перевод. Всё должно начинаться с большой буквы.\n\n'
            'Пример:\n'
            'Lotnisko\n'
            'Аэропорт, Лётчик, Лотерея, Лот\n'
            'Аэропорт'
        "";
        await ctx.reply(reply);
        ctx.wizard.state.word = {};
        return ctx.wizard.next();
    },
    async (ctx) => {
        const array = ctx.message.text.split('\n');
        // if (ctx.message.text.length <= 1) {
        if (array.length < 3) {
            await ctx.reply('Неверный формат. Убедитесь, что вы вводите всё с новой строки');
            return;
        }
        const word = array[0];
        const translations = array[1].split(', ');
        const rightTranslation = array[2];

        ctx.wizard.state.word.origin = word;
        
        if (translations.count <= 2 || translations.count > 4) {
            await ctx.reply('Введите 2-4 перевода через запятую');
            return;
        }
        ctx.wizard.state.word.translations = translations;

        if (!translations.includes(rightTranslation)) {
            await ctx.reply('Введите правильный перевод слова');
            return;
        }
        ctx.wizard.state.word.rightTranslation = rightTranslation;

        try {
            await db.saveWord(ctx.wizard.state.word);
            analytics.trackWordAdded(ctx.from.id, ctx.wizard.state.word.origin);
            await ctx.reply('Спасибо за добавление слова 💕');
        } catch (error) {
            console.log(error);
            await ctx.reply(`Error occurred: ${error.detail}`);
        }
        return ctx.scene.leave();
    }
);

export default addWordScene;