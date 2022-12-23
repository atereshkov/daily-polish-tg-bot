import { Scenes } from 'telegraf';

import * as constants from '../constants.js';
import * as db from '../database/database.js';
import * as analytics from '../analytics/analytics.js';

const addWordScene = new Scenes.WizardScene(
    constants.SCENE_ID_ADD_WORD,
    async (ctx) => {
        const reply = 'Введите слово, переводы (до 4-ех) и правильный перевод. Слова с большой буквы. Разделяйте варианты переводов запятой.\n\nПример:\nLotnisko\nАэропорт, Лётчик, Лотерея, Лот\nАэропорт'
        await ctx.reply(reply);
        ctx.wizard.state.word = {};
        return ctx.wizard.next();
    },
    async (ctx) => {
        const array = ctx.message.text.split('\n');
        if (array.length < 3) {
            await ctx.reply('Неверный формат. Убедитесь, что слово, варианты и правильный перевод введены с новой строки');
            return;
        }
        const word = array[0].trim();
        const translations = array[1].split(', ').map(s => s.trim());
        const rightTranslation = array[2].trim();

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
            const getWord = await db.getWord(ctx.wizard.state.word.origin);
            const word = getWord.rows[0];
            if (word) {
                await ctx.reply(`Слово "${word.origin}" уже есть в нашей базе. Попробуйте добавить другое слово.`);
            } else {
                analytics.trackWordAdded(ctx.from.id, ctx.wizard.state.word.origin);
                await db.saveWord(ctx.wizard.state.word, ctx.from.id);
                await db.updateUserWordsStats(ctx.from.id);
                await ctx.reply('Спасибо за добавление слова 💕\n\nИспользуйте команду /add_word для добавления новых слов.');
                if (ctx.from.id == 732811928) {
                    await ctx.reply('Привет Котис');
                }
            }
        } catch (error) {
            console.log(error);
            await ctx.reply('Произошла ошибка. Попробуйте ещё раз');
        }
        return ctx.scene.leave();
    }
);

addWordScene.command("cancel", async (ctx) => {
    await ctx.reply('Текущая операция закончена.');
    return ctx.scene.leave();
});

export default addWordScene;