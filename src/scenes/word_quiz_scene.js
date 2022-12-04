import { Scenes, Markup } from 'telegraf';

import Translation from '../models/translation.js';
import Word from '../models/word.js';
import * as constants from '../constants.js';

const translationsRu1 = [
    new Translation("Привет", true, 1),
    new Translation("Пока", false, 2),
    new Translation("Честь", false, 3),
    new Translation("Чехия", false, 4)
];
const translationsEn1 = [
    new Translation("Hi", true, 1),
    new Translation("Bye", false, 2),
    new Translation("Chest", false, 3),
    new Translation("Czech", false, 4)
];
const word1 = new Word(1, 'Cześć', translationsRu1, translationsEn1);

var wordsArray = [word1];

function getRandomWord() {
    var randomWord = Math.floor(Math.random() * wordsArray.length);
    return wordsArray[randomWord];
}

const wordQuizScene = new Scenes.BaseScene(constants.SCENE_ID_WORD_QUIZ);

wordQuizScene.enter((ctx) => {
    const word = getRandomWord();
    
    ctx.session.myData = {
        word: word
    };

    var buttons = [];

    let sortedTranslations = word.translationsRu.sort((a, b) => a.order > b.order);

    for (let i = 0; i < sortedTranslations.length; i++) {
        const id = sortedTranslations[i].order;
        buttons.push(Markup.button.callback(sortedTranslations[i].value, `QUIZ_WORD_ACTION_${id}`));
    }

    ctx.reply(`${word.original}`, Markup.inlineKeyboard(buttons));
});

wordQuizScene.action(/QUIZ_WORD_ACTION_+/, (ctx) => {
    let translationId = ctx.match.input.substring("QUIZ_WORD_ACTION_".length);
    console.log(translationId);
    console.log(ctx.session.myData.word);

    const translation = ctx.session.myData.word.translationsRu.find(x => x.order == translationId);
    ctx.session.myData.quizAnswer = translation;
    
    ctx.editMessageReplyMarkup();

    var answer = '';
    if (translation.result == true) {
        answer = ctx.session.myData.word.original + '\n' + translation.value + ' ✅';
    } else {
        // const rightTranslation = ctx.session.myData.word.translationsRu.find(x => x.result == true);
        answer = ctx.session.myData.word.original + '\n' + translation.value + ' ❌';
    }
    ctx.editMessageText(answer, {
        parse_mode: "HTML"
    });
    return ctx.scene.leave();
});

wordQuizScene.use((ctx) => ctx.replyWithMarkdownV2('Please choose a word'));

export default wordQuizScene;