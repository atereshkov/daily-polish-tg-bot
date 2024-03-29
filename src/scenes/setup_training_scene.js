import { Scenes, Markup } from 'telegraf';
import * as constants from '../constants.js';
import * as db from '../database/database.js';
import * as analytics from '../analytics/analytics.js';
import log from '../logger/logger.js';

const dailyWordScene = new Scenes.BaseScene(constants.SCENE_ID_SETUP_TRAINING);

dailyWordScene.enter((ctx) => {
    log.debug(`Entered scene ${constants.SCENE_ID_SETUP_TRAINING}`);
    ctx.session.myData = {};
    const line1 = 'Тренируйте случайное слово каждое утро.';
    const line2 = '🕒 Мы будем отправлять тебе напоминалку в 09:00 (по Польше).';
    const reply = `${line1}\n${line2}`;
    return ctx.reply(reply, Markup.inlineKeyboard([
        Markup.button.callback('Я в деле, включить', "ACTION_ENABLE"),
        Markup.button.callback('Сдаюсь, отключить', "ACTION_DISABLE")
    ]));
});

dailyWordScene.action('ACTION_ENABLE', async (ctx) => {
    log.debug(`Scheduler set up - ACTION_ENABLE`);
    await setUpDailyTraining(ctx, true);
    analytics.trackTrainingEnabled(ctx.from.id);
    return ctx.reply('Отлично! Тренировка включена.');
});

dailyWordScene.action('ACTION_DISABLE', async (ctx) => {
    log.debug(`Scheduler set up - ACTION_DISABLE`);
    await setUpDailyTraining(ctx, false);
    analytics.trackTrainingDisabled(ctx.from.id);
    return ctx.reply('Тренировка отключена. Печалька :(');
});

dailyWordScene.command("cancel", async (ctx) => {
    log.debug('Cancelled current command');
    await ctx.reply('Текущая операция отменена.\nОтправь /help чтобы увидеть список команд.');
    return ctx.scene.leave();
});

async function setUpDailyTraining(ctx, enabled) {
    const tgId = ctx.from.id;
    const getUser = await db.getUser(tgId);
    const user = getUser.rows[0];
    if (user) {
        try {
            const getTraining = await db.getTraining(tgId);
            const training = getTraining.rows[0];
            if (training) {
                await db.updateTraining(tgId, enabled);
                log.debug(`Update training ${tgId}, enabled: ${enabled}`);
            } else {
                await db.createTraining(tgId, enabled);
                log.debug(`Create training ${tgId}, enabled: ${enabled}`);
            }
        } catch (error) {
            log.error(error);
            return ctx.reply('Произошла ошибка. Попробуйте позже');
        }
    } else {
        log.info(`User not found when setting up daily training ${ctx.from.id}`);
        return ctx.reply('Чтобы настроить ежедневную тренировку, нужно создать аккаунт командой /start');
    }
}

export default dailyWordScene;