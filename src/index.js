import { Telegraf, Scenes, session } from 'telegraf';
import express from 'express';

import * as dotenv from 'dotenv';
dotenv.config()

import * as constants from './constants.js';
import log from './logger/logger.js';
import * as scheduler from './scheduler/scheduler.js';
import chooseLanguageScene from './scenes/choose_language_scene.js';
import wordQuizScene from './scenes/word_quiz_scene.js';
import addWordScene from './scenes/add_word_scene.js';
import userStatsScene from './scenes/user_stats_scene.js';
import setUpTrainingScene from './scenes/setup_training_scene.js';

let bot;

if (process.env.NODE_ENV === "production") {
    bot = new Telegraf(process.env.BOT_TOKEN);
} else {
    bot = new Telegraf(process.env.TEST_BOT_TOKEN);
}

const app = express();

const stage = new Scenes.Stage([
    chooseLanguageScene,
    wordQuizScene,
    addWordScene,
    userStatsScene,
    setUpTrainingScene
]);

bot.use(session());
bot.use(stage.middleware());

bot.command("start", ctx => {
    return ctx.scene.enter(constants.SCENE_ID_CHOOSE_LANGUAGE);
});

bot.command("language", ctx => {
    return ctx.scene.enter(constants.SCENE_ID_CHOOSE_LANGUAGE, { direct_command: true });
});

bot.command('training_settings', (ctx) => ctx.scene.enter(constants.SCENE_ID_SETUP_TRAINING));

bot.command("word", ctx => {
    return ctx.scene.enter(constants.SCENE_ID_WORD_QUIZ, { type: constants.QuizTypes.all });
});
bot.command("my_word", ctx => {
    return ctx.scene.enter(constants.SCENE_ID_WORD_QUIZ, { type: constants.QuizTypes.my });
});
bot.command('stats', (ctx) => ctx.scene.enter(constants.SCENE_ID_USER_STATS));
bot.command('add_word', (ctx) => ctx.scene.enter(constants.SCENE_ID_ADD_WORD));

bot.help((ctx) => {
    const header = 'Доступные команды:';
    const word = '/word - Тренировать слова';
    const myWord = '/my_word - Тренировать слова из моего словаря';
    const trainingSettings = '/training_settings - Включить / отключить ежедневную тренировку';
    const addWord = '/add_word - Добавить новое слово';
    const stats = '/stats - Посмотреть статистику';
    const cancel = '/cancel - Завершить текущую операцию';
    const footer1 = 'Присоединяйся к нашему чату в ТГ, где можно пообщаться о польском языке, предложить свою идею для бота или сообщить об ошибке.';
    const footer2 = 'https://t.me/daily_polish';
    const reply = `${header}\n\n${word}\n${myWord}\n${trainingSettings}\n${addWord}\n${stats}\n${cancel}\n\n${footer1}\n${footer2}`;
    return ctx.reply(reply);
});

if (process.env.NODE_ENV === "production") {
    app.use(express.json());
    app.use(await bot.createWebhook({ domain: process.env.WEBHOOK_URL }));
    app.listen(process.env.WEBHOOK_PORT, '0.0.0.0', () => console.log("Listening on port", process.env.WEBHOOK_PORT));
    log.info(`Bootstrap on ${process.env.WEBHOOK_PORT}`);
} else {
    bot.launch();
    log.info(`Launched in polling mode (${process.env.NODE_ENV})`);
}

scheduler.bootstrap(bot);

// Enable graceful stop
process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

function shutdown(reason) {
    log.info(`Shutting down.. ${reason}`);
    
    bot.stop(reason);

    const stopScheduler = scheduler.shutdown();
    Promise
        .all([stopScheduler].map(p => p.catch(e => e)))
        .then(() => process.exit(0))
        .catch(e => log.log(e));
}