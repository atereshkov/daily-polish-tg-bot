import { Telegraf, Scenes, session } from 'telegraf';
import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config()

import * as constants from './constants.js';
import log from './logger/logger.js';
import chooseLanguageScene from './scenes/choose_language_scene.js';
import wordQuizScene from './scenes/word_quiz_scene.js';
import addWordScene from './scenes/add_word_scene.js';
import userStatsScene from './scenes/user_stats_scene.js';

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
    userStatsScene
]);

bot.use(session());
bot.use(stage.middleware());

bot.command("start", ctx => {
    return ctx.scene.enter(constants.SCENE_ID_CHOOSE_LANGUAGE);
});

bot.command("language", ctx => {
    return ctx.scene.enter(constants.SCENE_ID_CHOOSE_LANGUAGE, { direct_command: true });
});

bot.command('word', (ctx) => ctx.scene.enter(constants.SCENE_ID_WORD_QUIZ));
// bot.command('my_word', (ctx) => ctx.scene.enter(constants.SCENE_ID_USER_WORD_QUIZ));
bot.command('stats', (ctx) => ctx.scene.enter(constants.SCENE_ID_USER_STATS));
bot.command('add_word', (ctx) => ctx.scene.enter(constants.SCENE_ID_ADD_WORD));

if (process.env.NODE_ENV === "production") {
    app.use(express.json());
    app.use(await bot.createWebhook({ domain: process.env.WEBHOOK_URL }));
    app.listen(process.env.WEBHOOK_PORT, '0.0.0.0', () => console.log("Listening on port", process.env.WEBHOOK_PORT));
    log.info(`Bootstrap on ${process.env.WEBHOOK_PORT}`);
} else {
    bot.launch();
    log.info(`Launched in polling mode (${process.env.NODE_ENV})`);
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));