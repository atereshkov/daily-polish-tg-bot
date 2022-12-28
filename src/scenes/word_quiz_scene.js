import { Scenes, Markup } from 'telegraf';

import Word from '../models/word.js';
import * as constants from '../constants.js';
import * as db from '../database/database.js';
import * as analytics from '../analytics/analytics.js';
import log from '../logger/logger.js';

async function getRandomWord(type, tgId) {
    var word;
    try {
        let res;
        switch (type) {
            case constants.QuizTypes.all:
                res = await db.getRandomWord();
                break;
            case constants.QuizTypes.my:
                res = await db.getRandomUserWord(tgId);
                break;
        }
        word = res.rows[0];
        log.debug(`Generated random word ${word.origin}, type: ${type} for ${tgId}`);
    } catch (error) {
        log.error(error);
    }

    if (!word) {
        throw new Error('Can not find a word in the dataset');;
    }

    var sortedTranslations = [word.translation1, word.translation2, word.translation3, word.translation4]
        .map(value => ({ value, order: Math.random() }))
        .sort((a, b) => a.order - b.order);

    for (let i = 0; i < sortedTranslations.length; i++) {
        // assign an id which is going to be used in actions
        sortedTranslations[i].id = i;
    }

    return new Word(word.id, word.origin, sortedTranslations, word.right_translation);
}

async function showNewWord(ctx, type) {
    let word;

    try {
        word = await getRandomWord(type, ctx.from.id);
    } catch (error) {
        return ctx.reply('Не могу найти слово.. Может быть у тебя пустой словарь?\nПопробуй загрузить из общего словаря или добавь своё командой /add_word.');
    }

    ctx.session.myData = { word: word };

    var buttons = [];
    for (let i = 0; i < word.translations.length; i++) {
        const id = word.translations[i].id;
        if (word.translations[i].value != null) {
            buttons.push([Markup.button.callback(`${word.translations[i].value}`, `QUIZ_WORD_ACTION_${id}`)]);
        }
    }

    analytics.trackWordQuizShowed(ctx.from.id, word.origin, type);
    return ctx.reply(`${word.origin}`, Markup.inlineKeyboard(buttons));
}

const wordQuizScene = new Scenes.BaseScene(constants.SCENE_ID_WORD_QUIZ);

wordQuizScene.enter(async (ctx) => {
    const type = ctx.scene.state.type;
    log.info(`Entered scene ${constants.SCENE_ID_WORD_QUIZ}, type: ${type}`);
    return showNewWord(ctx, type);
});

wordQuizScene.action(/QUIZ_WORD_ACTION_+/, async (ctx) => {
    log.debug(`Word answer action ${ctx.match.input}`);
    let translationId = ctx.match.input.substring("QUIZ_WORD_ACTION_".length);
    const translation = ctx.session.myData.word.translations.find(x => x.id == translationId);
    const isRight = ctx.session.myData.word.isRightTranslation(translation.value);

    var answer = '';
    if (isRight) {
        answer = ctx.session.myData.word.origin + '\n' + translation.value + ' ✅';
    } else {
        answer = ctx.session.myData.word.origin + '\n' + translation.value + ' ❌';
        answer += '\nПравильный перевод: ' + ctx.session.myData.word.rightTranslation;
    }

    db.updateUserAnswers(ctx.from.id, isRight);
    analytics.trackWordQuizAnswered(ctx.from.id, isRight, ctx.session.myData.word.origin);

    await ctx.editMessageText(answer, {
        parse_mode: "HTML"
    });
    return ctx.editMessageReplyMarkup({
        inline_keyboard: [
            [Markup.button.callback('Новое слово из общего словаря', "QUIZ_GET_NEW_WORD_ALL")],
            [Markup.button.callback('Новое слово из моего словаря', "QUIZ_GET_NEW_WORD_MY")],
        ]
    });
});

wordQuizScene.action("QUIZ_GET_NEW_WORD_ALL", async (ctx) => {
    return showNewWord(ctx, constants.QuizTypes.all);
});

wordQuizScene.action("QUIZ_GET_NEW_WORD_MY", async (ctx) => {
    return showNewWord(ctx, constants.QuizTypes.my);
});

wordQuizScene.command("cancel", async (ctx) => {
    log.info('Cancelled current command');
    await ctx.reply('Текущая операция отменена.\nОтправь /help чтобы увидеть список команд.');
    return ctx.scene.leave();
});

// wordQuizScene.use((ctx) => ctx.replyWithMarkdownV2('Please choose a word'));

export default wordQuizScene;