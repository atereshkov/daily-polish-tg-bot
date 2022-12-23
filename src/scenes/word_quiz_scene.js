import { Scenes, Markup } from 'telegraf';

import Word from '../models/word.js';
import * as constants from '../constants.js';
import * as db from '../database/database.js';
import * as analytics from '../analytics/analytics.js';

async function getRandomWord() {
    var word;
    try {
        const res = await db.getRandomWord();
        word = res.rows[0];
    } catch (err) {
        console.log(err.stack);
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

async function showNewWord(ctx) {
    const word = await getRandomWord();

    ctx.session.myData = { word: word };

    var buttons = [];
    for (let i = 0; i < word.translations.length; i++) {
        const id = word.translations[i].id;
        if (word.translations[i].value != null) {
            buttons.push(Markup.button.callback(`${word.translations[i].value}`, `QUIZ_WORD_ACTION_${id}`));
        }
    }

    analytics.trackWordQuizShowed(ctx.from.id, word.origin);
    return ctx.reply(`${word.origin}`, Markup.inlineKeyboard(buttons));
}

const wordQuizScene = new Scenes.BaseScene(constants.SCENE_ID_WORD_QUIZ);

wordQuizScene.enter(async (ctx) => {
    return showNewWord(ctx);
});

wordQuizScene.action(/QUIZ_WORD_ACTION_+/, async (ctx) => {
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
    await ctx.editMessageReplyMarkup({
        inline_keyboard: [
            [Markup.button.callback('Новое слово', "QUIZ_GET_NEW_WORD")],
        ]
    });
});

wordQuizScene.action("QUIZ_GET_NEW_WORD", async (ctx) => {
    return showNewWord(ctx);
});

wordQuizScene.command("cancel", async (ctx) => {
    await ctx.reply('Текущая операция закончена.');
    return ctx.scene.leave();
});

// wordQuizScene.use((ctx) => ctx.replyWithMarkdownV2('Please choose a word'));

export default wordQuizScene;