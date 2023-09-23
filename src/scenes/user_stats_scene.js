import { Scenes, Markup } from 'telegraf';
import * as constants from '../constants.js';
import * as db from '../database/database.js';
import * as analytics from '../analytics/analytics.js';
import log from '../logger/logger.js';

const userStatsScene = new Scenes.BaseScene(constants.SCENE_ID_USER_STATS);

userStatsScene.enter(async (ctx) => {
    log.debug(`Entered scene ${constants.SCENE_ID_USER_STATS}`);
    analytics.trackUserStatsShowed(ctx.from.id);

    const getUserStats = await db.getUserStats(ctx.from.id);
    const stats = getUserStats.rows[0];

    if (!stats) {
        log.info(`Stats not found for user ${ctx.from.id}`);
        return ctx.reply('Статистика не найдена. Начните тренировать слова командой /start');
    }

    const answers = `✅ Правильных ответов: ${stats.right_answers}\n❌ Неверных ответов: ${stats.wrong_answers}`;
    const words = `📙 Всего добавлено слов: ${stats.words_added}`;
    const message = answers + '\n\n' + words;
    return ctx.reply(message);
});

export default userStatsScene;