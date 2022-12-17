import { Scenes, Markup } from 'telegraf';
import * as constants from '../constants.js';
import * as db from '../database/database.js';
import * as analytics from '../analytics/analytics.js';

const chooseLanguageScene = new Scenes.BaseScene(constants.SCENE_ID_CHOOSE_LANGUAGE);

chooseLanguageScene.enter((ctx) => {
    ctx.session.myData = {};
    // const msgRu = 'Learn Polish from Russian or English. You could change it anytime.';
    // const msgEn = 'Учи польский с Русского и Английского. Можешь изменить свой выбор позже.';
    // const reply = msgEn + '\n' + msgRu;
    const reply = 'Выберите язык, чтобы начать.\n We are going to support more languages soon.';
    ctx.reply(reply, Markup.inlineKeyboard([
        // Markup.button.callback('English', "ACTION_LANGUAGE_EN"),
        Markup.button.callback('Русский', "ACTION_LANGUAGE_RU")
    ]));
});

chooseLanguageScene.action(/ACTION_LANGUAGE_+/, async (ctx) => {
    let languageCode = ctx.match.input.substring("ACTION_LANGUAGE_".length);
    ctx.editMessageReplyMarkup();
    ctx.editMessageText(`Ok, ${languageCode}. Noted. Great!`);
    setLanguage(ctx.from.id, languageCode);
    analytics.trackLanguageSelected(ctx.from.id, languageCode);
    if (ctx.scene.state.direct_command == true) {
        return ctx.scene.leave();
    } else {
        return ctx.scene.enter(constants.SCENE_ID_WORD_QUIZ);
    }
});

chooseLanguageScene.use((ctx) => ctx.replyWithMarkdownV2('Please choose either English or Russian'));

async function setLanguage(tgId, languageCode) {
    const isUserExists = await db.isUserExists(tgId);
    if (isUserExists) {
        try {
            await db.updateUserLanguage(tgId, languageCode);
        } catch (error) {
            console.error(error);
        }
    } else {
        try {
            await db.createUserAnswers(tgId);
            await db.createUser(tgId, languageCode);
        } catch (error) {
            console.error(error);
        }
    }
}

export default chooseLanguageScene;