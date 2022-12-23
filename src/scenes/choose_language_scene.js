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
    const reply = 'Выберите язык, чтобы начать.\nWe are going to support more languages soon.';
    return ctx.reply(reply, Markup.inlineKeyboard([
        // Markup.button.callback('English', "ACTION_LANGUAGE_EN"),
        Markup.button.callback('Русский', "ACTION_LANGUAGE_RU")
    ]));
});

chooseLanguageScene.action(/ACTION_LANGUAGE_+/, async (ctx) => {
    let languageCode = ctx.match.input.substring("ACTION_LANGUAGE_".length);
    await ctx.editMessageReplyMarkup();
    await ctx.editMessageText(`Ok, ${languageCode}. Noted. Great!`);
    await setLanguage(ctx.from.id, languageCode);
    if (ctx.scene.state.direct_command == true) {
        return ctx.scene.leave();
    } else {
        return ctx.scene.enter(constants.SCENE_ID_WORD_QUIZ);
    }
});

// chooseLanguageScene.use((ctx) => ctx.replyWithMarkdownV2('Пожалуйста, выберите язык'));

chooseLanguageScene.command("cancel", async (ctx) => {
    await ctx.reply('Текущая операция закончена.');
    return ctx.scene.leave();
});

async function setLanguage(tgId, languageCode) {
    const getUser = await db.getUser(tgId);
    const user = getUser.rows[0];
    if (user) {
        try {
            await db.updateUserLanguage(tgId, languageCode);
            analytics.trackLanguageSelected(ctx.from.id, languageCode);
            console.log(`[setLanguage] Update user language ${tgId}`);
        } catch (error) {
            console.error(error);
        }
    } else {
        try {
            const getUserStats = await db.getUserStats(tgId);
            const userStats = getUserStats.rows[0];
            if (!userStats) {
                await db.createUserStats(tgId);
            }
            await db.createUser(tgId, languageCode);
            analytics.trackUserCreated(ctx.from.id, languageCode);
            console.log(`[setLanguage] User created ${tgId}, language: ${languageCode}`);
        } catch (error) {
            console.error(error);
        }
    }
}

export default chooseLanguageScene;