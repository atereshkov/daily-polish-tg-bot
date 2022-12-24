import { Scenes } from 'telegraf';

import * as constants from '../constants.js';
import * as db from '../database/database.js';
import * as analytics from '../analytics/analytics.js';
import log from '../logger/logger.js';

const SEPARATOR = '.'

const addWordScene = new Scenes.WizardScene(
    constants.SCENE_ID_ADD_WORD,
    async (ctx) => {
        log.info(`Entered scene ${constants.SCENE_ID_ADD_WORD}`);
        const reply = 'Введите слово, переводы (2-4 шт) и правильный перевод. Слова пишите с большой буквы. Разделите варианты переводов точкой.\n\nПример:\nLotnisko\nАэропорт. Лётчик. Лотерея. Лот\nАэропорт'
        await ctx.reply(reply);
        ctx.wizard.state.word = {};
        return ctx.wizard.next();
    },
    async (ctx) => {
        log.debug(`Received ${ctx.message.text}`);
        const array = ctx.message.text.split('\n');
        if (array.length < 3) {
            await ctx.reply('Неверный формат. Убедитесь, что слово, варианты и правильный перевод введены с новой строки.');
            return;
        }
        const word = array[0].trim().replace(/^\.+|\.+$/g, ''); // Trim trailing or leading dot
        const translations = array[1]
            .split(`${SEPARATOR} `)
            .map(s => s.trim()) // Trim whitespaces
            .map(s => s.replace(/^\.+|\.+$/g, '')) // Remove trailing or leading dot
        const rightTranslation = array[2].trim().replace(/^\.+|\.+$/g, ''); // Trim trailing or leading dot

        ctx.wizard.state.word.origin = word;
        
        if (translations.count <= 2 || translations.count > 4) {
            await ctx.reply('Неверный формат. Переводы нужно разделять точкой. Может быть от 2ух до 4ех вариантов.');
            return;
        }
        ctx.wizard.state.word.translations = translations;

        if (!translations.includes(rightTranslation)) {
            await ctx.reply('Введите правильный перевод слова');
            return;
        }
        ctx.wizard.state.word.rightTranslation = rightTranslation;

        log.debug(`Word "${ctx.wizard.state.word.origin}" added to the dataset. Translations: ${translations}. Right translation: ${rightTranslation}`);

        try {
            const getWord = await db.getWord(ctx.wizard.state.word.origin);
            const word = getWord.rows[0];
            if (word) {
                log.debug(`User ${ctx.from.id} tried adding word "${word.origin}" that is already exists in the dataset`);
                await ctx.reply(`Слово "${word.origin}" уже есть в нашей базе. Попробуйте добавить другое слово.`);
            } else {
                analytics.trackWordAdded(ctx.from.id, ctx.wizard.state.word.origin);
                await db.saveWord(ctx.wizard.state.word, ctx.from.id);
                await db.updateUserWordsStats(ctx.from.id);
                await ctx.reply('Спасибо за добавление слова 💕\n\nИспользуйте команду /add_word для добавления новых слов.');
                log.info(`Word ${ctx.wizard.state.word.origin} added to the dataset. Translations: ${translations}. Right translation: ${rightTranslation}`);
            }
        } catch (error) {
            log.error(error);
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