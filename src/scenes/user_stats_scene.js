import { Scenes, Markup } from 'telegraf';
import * as constants from '../constants.js';
import * as db from '../database/database.js';
import * as analytics from '../analytics/analytics.js';

const userStatsScene = new Scenes.BaseScene(constants.SCENE_ID_USER_STATS);

userStatsScene.enter(async (ctx) => {
    analytics.trackUserStatsShowed(ctx.from.id);

    // await ctx.reply('Загружаем вашу статистику...');

    const getUserStats = await db.getUserStats(ctx.from.id);
    const stats = getUserStats.rows[0];

    if (!stats) {
        return ctx.reply('Статистика не найдена. Начните тренировать слова командой /start');
    }

    const answers = `✅ Правильных ответов: ${stats.right_answers}\n❌ Неверных ответов: ${stats.wrong_answers}`;
    const words = `📙 Всего слов добавлено: ${stats.words_added}`;
    const message = answers + '\n\n' + words;
    return ctx.reply(message);
});

export default userStatsScene;