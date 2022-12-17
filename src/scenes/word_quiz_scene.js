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

const wordQuizScene = new Scenes.BaseScene(constants.SCENE_ID_WORD_QUIZ);

wordQuizScene.enter(async (ctx) => {
    const word = await getRandomWord();
    
    ctx.session.myData = { word: word };

    var buttons = [];
    for (let i = 0; i < word.translations.length; i++) {
        const id = word.translations[i].id;
        buttons.push(Markup.button.callback(word.translations[i].value, `QUIZ_WORD_ACTION_${id}`));
    }

    analytics.trackWordQuizShowed(ctx.from.id, word.origin);
    ctx.reply(`${word.origin}`, Markup.inlineKeyboard(buttons));
});

wordQuizScene.action(/QUIZ_WORD_ACTION_+/, (ctx) => {
    let translationId = ctx.match.input.substring("QUIZ_WORD_ACTION_".length);
    const translation = ctx.session.myData.word.translations.find(x => x.id == translationId);
    const isRight = ctx.session.myData.word.isRightTranslation(translation.value);

    var answer = '';
    if (isRight) {
        answer = ctx.session.myData.word.origin + '\n' + translation.value + ' ✅';
    } else {
        // const rightTranslation = ctx.session.myData.word.translationsRu.find(x => x.result == true);
        answer = ctx.session.myData.word.origin + '\n' + translation.value + ' ❌';
    }

    ctx.editMessageReplyMarkup();
    ctx.editMessageText(answer, {
        parse_mode: "HTML"
    });

    db.updateUserAnswers(ctx.from.id, isRight);
    analytics.trackWordQuizAnswered(ctx.from.id, isRight, ctx.session.myData.word.origin);

    return ctx.scene.leave();
});

wordQuizScene.use((ctx) => ctx.replyWithMarkdownV2('Please choose a word'));

export default wordQuizScene;