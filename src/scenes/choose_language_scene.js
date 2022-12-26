import { Scenes, Markup } from 'telegraf';
import * as constants from '../constants.js';
import * as db from '../database/database.js';
import * as analytics from '../analytics/analytics.js';
import log from '../logger/logger.js';

const chooseLanguageScene = new Scenes.BaseScene(constants.SCENE_ID_CHOOSE_LANGUAGE);

chooseLanguageScene.enter((ctx) => {
    log.info(`Entered scene ${constants.SCENE_ID_CHOOSE_LANGUAGE}`);
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
    log.debug(`Language action ${ctx.match.input}, direct: ${ctx.scene.state.direct_command}`);
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
    log.info('Cancelled current command');
    await ctx.reply('Текущая операция отменена.\nОтправь /help чтобы увидеть список команд.');
    return ctx.scene.leave();
});

async function setLanguage(tgId, languageCode) {
    const getUser = await db.getUser(tgId);
    const user = getUser.rows[0];
    if (user) {
        try {
            await db.updateUserLanguage(tgId, languageCode);
            analytics.trackLanguageSelected(tgId, languageCode);
            log.info(`Update user language ${tgId}, value: ${languageCode}`);
        } catch (error) {
            log.error(error);
        }
    } else {
        try {
            const getUserStats = await db.getUserStats(tgId);
            const userStats = getUserStats.rows[0];
            if (!userStats) {
                log.info(`Creating user stats for ${tgId}`);
                await db.createUserStats(tgId);
            }
            log.info(`Creating user ${tgId}`);
            await db.createUser(tgId, languageCode);
            analytics.trackUserCreated(tgId, languageCode);
            log.info(`User created ${tgId}, language: ${languageCode}`);
        } catch (error) {
            log.error(error);
        }
    }
}

export default chooseLanguageScene;