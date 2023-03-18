import { Scenes } from 'telegraf';

import * as constants from '../constants.js';
import * as db from '../database/database.js';
import * as analytics from '../analytics/analytics.js';
import log from '../logger/logger.js';

const SEPARATOR = '.'

const addWordScene = new Scenes.WizardScene(
    constants.SCENE_ID_ADD_WORD,
    async (ctx) => {
        log.debug(`Entered scene ${constants.SCENE_ID_ADD_WORD}`);
        const firstLine = 'Слово добавляется в твой словарь и в общую базу.';
        const secondLine = 'Введи слово, переводы (2-4 шт) и правильный перевод. Слова пиши с большой буквы. Раздели варианты переводов точкой. Отправь всё в одном сообщении, как в примере.';
        const example = 'Пример:\nLotnisko\nАэропорт. Лётчик. Лотерея. Лот\nАэропорт';
        const reply = `${firstLine}\n\n${secondLine}\n\n${example}`;
        await ctx.reply(reply);
        ctx.wizard.state.word = {};
        return ctx.wizard.next();
    },
    async (ctx) => {
        log.debug(`Received ${ctx.message.text}`);
        const array = ctx.message.text.split('\n');
        if (array.length < 3) {
            await ctx.reply('Неверный формат. Слово, переводы и правильный перевод должен быть с новой строки. Весь текст нужно отправить заново.');
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
            await ctx.reply('Неверный формат. Переводы нужно разделять точкой. Может быть от 2ух до 4ех вариантов. Весь текст нужно отправить заново.');
            return;
        }
        ctx.wizard.state.word.translations = translations;

        if (!translations.includes(rightTranslation)) {
            await ctx.reply('Введи правильный перевод слова. Весь текст нужно отправить заново.');
            return;
        }
        ctx.wizard.state.word.rightTranslation = rightTranslation;

        try {
            const getWord = await db.getWord(ctx.wizard.state.word.origin);
            const word = getWord.rows[0];
            if (word) {
                log.debug(`User ${ctx.from.id} tried adding word ${word.origin} that is already exists in the dataset`);
                await ctx.reply(`Слово "${word.origin}" уже есть в нашей базе. Попробуйте добавить другое слово.\n\n/add_word - команда для добавления новых слов.`);
            } else {
                analytics.trackWordAdded(ctx.from.id, ctx.wizard.state.word.origin);
                await db.saveWord(ctx.wizard.state.word, ctx.from.id);
                await db.updateUserWordsStats(ctx.from.id);
                await ctx.reply('Спасибо за добавление слова 💕\n\nИспользуй команду /add_word для добавления новых слов.');
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
    log.debug('Cancelled current command');
    await ctx.reply('Текущая операция отменена.\nОтправь /help чтобы увидеть список команд.');
    return ctx.scene.leave();
});

export default addWordScene;